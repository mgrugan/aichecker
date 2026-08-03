"""Text extraction from uploaded documents (.txt, .md, .docx, .pdf)."""

from __future__ import annotations

import io


class ExtractionError(ValueError):
    pass


def extract_text(filename: str, data: bytes) -> str:
    name = filename.lower()
    if name.endswith((".txt", ".md")):
        try:
            return data.decode("utf-8")
        except UnicodeDecodeError:
            return data.decode("latin-1", errors="replace")
    if name.endswith(".docx"):
        try:
            import docx

            doc = docx.Document(io.BytesIO(data))
            return "\n\n".join(p.text for p in doc.paragraphs if p.text.strip())
        except Exception as e:  # noqa: BLE001
            raise ExtractionError(f"Could not read .docx file: {e}") from e
    if name.endswith(".pdf"):
        try:
            from pypdf import PdfReader

            reader = PdfReader(io.BytesIO(data))
            return "\n\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception as e:  # noqa: BLE001
            raise ExtractionError(f"Could not read .pdf file: {e}") from e
    raise ExtractionError(
        "Unsupported file type. Please upload a .txt, .md, .docx, or .pdf file."
    )
