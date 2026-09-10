"""DOM regression: «Оценить» must not be intercepted by article owner-decision."""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
APP_JS = ROOT / "src" / "job_search_web" / "static" / "app.js"


@dataclass
class Node:
    tag: str
    attrs: dict[str, str] = field(default_factory=dict)
    parent: Node | None = None
    children: list[Node] = field(default_factory=list)
    text: str = ""

    def get(self, name: str) -> str | None:
        return self.attrs.get(name)

    def matches(self, selector: str) -> bool:
        # Minimal CSS subset used by app.js click handlers.
        tag = None
        attr = None
        attr_val = None
        m = re.fullmatch(r'([a-z0-9_-]+)?(?:\[([a-z0-9_-]+)(?:=\"([^\"]*)\")?\])?', selector)
        if not m:
            return False
        tag, attr, attr_val = m.group(1), m.group(2), m.group(3)
        if tag and self.tag != tag:
            return False
        if attr is not None:
            if attr not in self.attrs:
                return False
            if attr_val is not None and self.attrs.get(attr) != attr_val:
                return False
        return True

    def closest(self, selector: str) -> Node | None:
        cur: Node | None = self
        while cur is not None:
            if cur.matches(selector):
                return cur
            cur = cur.parent
        return None


class TreeBuilder(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.root = Node(tag="document")
        self.stack = [self.root]

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        node = Node(tag=tag, attrs={k: (v or "") for k, v in attrs}, parent=self.stack[-1])
        self.stack[-1].children.append(node)
        # void-ish tags we may still nest simply for this fixture
        if tag not in {"br", "img", "input", "meta", "link", "hr"}:
            self.stack.append(node)

    def handle_endtag(self, tag: str) -> None:
        # pop until matching tag
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                break

    def handle_data(self, data: str) -> None:
        if self.stack:
            self.stack[-1].text += data


def _find(node: Node, predicate) -> Node | None:
    if predicate(node):
        return node
    for child in node.children:
        found = _find(child, predicate)
        if found:
            return found
    return None


def _real_vacancy_card_html() -> str:
    """Shape mirrors vacancyRow(): article[data-owner-decision] + [data-score] button."""
    return """
<article class="list-row-group list-row-group--vacancy" data-id="93f77c9d-9645-418a-b224-e331a4e58713" data-status="new" data-source-status="active" data-scoring-state="unscored" data-owner-decision="unreviewed" data-action-channel="" data-verdict="">
  <div class="list-row">
    <div class="list-row__trailing">
      <div class="vacancy-assessment-summary"><span class="badge">Без оценки</span></div>
      <div class="list-row__actions">
        <a class="btn" href="https://hh.ru/vacancy/137224132">HH</a>
        <label class="list-row__control"><select data-status><option>new</option></select></label>
        <button class="btn btn--secondary btn--sm" data-score type="button">Оценить</button>
        <button class="btn btn--secondary btn--sm" data-apply type="button">Записать отклик</button>
      </div>
    </div>
  </div>
  <details class="row-detail">
    <summary>Разбор</summary>
    <div class="row-detail__body">
      <div class="owner-decision" data-owner-current="unreviewed">
        <div class="owner-decision__actions">
          <button type="button" data-owner-decision="interested">Интересно</button>
        </div>
      </div>
    </div>
  </details>
</article>
"""


def test_oceneit_not_intercepted_by_article_owner_decision_dom() -> None:
    parser = TreeBuilder()
    parser.feed(_real_vacancy_card_html())
    score_btn = _find(
        parser.root,
        lambda n: n.tag == "button" and "data-score" in n.attrs and "Оценить" in n.text,
    )
    assert score_btn is not None

    # Footgun that previously caused silent PATCH: broad attribute selector.
    broad = score_btn.closest("[data-owner-decision]")
    assert broad is not None
    assert broad.tag == "article"
    assert broad.get("data-owner-decision") == "unreviewed"

    # Current handlers must use button-scoped selector — score click must NOT match.
    decision_btn = score_btn.closest("button[data-owner-decision]")
    assert decision_btn is None

    score_match = score_btn.closest("[data-score]")
    assert score_match is score_btn

    # Guard app.js still uses the safe selectors / order.
    js = APP_JS.read_text(encoding="utf-8")
    assert 'closest("button[data-owner-decision]")' in js
    assert 'closest("[data-owner-decision]")' not in js
    click_region = js.split('grid.addEventListener("click"', 1)[1]
    assert click_region.index('closest("[data-score]")') < click_region.index(
        'closest("button[data-owner-decision]")'
    )
