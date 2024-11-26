class ValidationError(Exception):
    ...


class MultiLanguageError(Exception):
    def __init__(self, languages: list[str]):
        self.languages = languages
        message = "Multiple valid languages found: %s" % ", ".join(languages)
        super().__init__(message)
