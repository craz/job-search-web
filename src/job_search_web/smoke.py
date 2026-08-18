"""Small dependency-free process smoke for the packaged Web application."""

from job_search_web import __version__


def main() -> None:
    """Print stable package identity for container and operator diagnostics."""
    print(f"job-search-web {__version__}")


if __name__ == "__main__":
    main()
