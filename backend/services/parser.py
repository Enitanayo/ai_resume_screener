import os
import re
import json
from typing import Dict, Any

from backend.config import settings

from google import genai
from google.genai import types
from pypdf import PdfReader
from docx import Document
from tenacity import retry, stop_after_attempt, wait_exponential

class ParserError(Exception):
    pass

class ResumeParser:
    def __init__(self):
        api_key = settings.gemini_api_key
        if not api_key:
            raise ParserError("Gemini API key not configured")

        self.client = genai.Client(api_key=api_key)

    def parse(self, file_path: str) -> Dict[str, Any]:
        try:
            raw_text = self._extract_text(file_path)
        except Exception as exc:
            raise ParserError("Failed to extract text from resume") from exc

        if not raw_text.strip():
            raise ParserError("Extracted resume text is empty")

        try:
            clean_text = self._clean_text(raw_text)
        except Exception as exc:
            raise ParserError("Failed to clean resume text after extraction")

        try:
            llm_data = self._extract_with_gemini(clean_text)
        except Exception as exc:
            raise ParserError("LLM extraction failed- would it change?") from exc

        # minimal validation
        if not isinstance(llm_data, dict):
            raise ParserError("LLM returned invalid data format")

        llm_data["raw_text"] = clean_text
        return llm_data
    
    def _extract_text(self, file_path: str) -> str:
        if not os.path.exists(file_path):
            raise FileNotFoundError(file_path)

        ext = os.path.splitext(file_path)[1].lower()

        if ext == ".pdf":
            reader = PdfReader(file_path)
            text = ""

            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

            if not text.strip():
                raise ParserError("PDF contains no extractable text")

            return text

        elif ext in {".docx", ".doc"}:
            doc = Document(file_path)
            text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())

            if not text.strip():
                raise ParserError("DOCX contains no extractable text")

            return text

        else:
            raise ValueError(f"Unsupported file type: {ext}")

    def _clean_text(self, text: str) -> str:
        text = text.replace("\t", " ")
        text = re.sub(r"[•●▪]", "-", text)
        text = re.sub(r"\n{2,}", "\n\n", text)
        return text.strip()
        
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=10))
    def _extract_with_gemini(self, text: str) -> Dict[str, Any]:
        prompt = f"""
        You are an expert HR Resume Parser. Extract structured data from the resume below.
        Return ONLY valid JSON
        Required keys:
        - name: str (full name of the candidate, or "Unknown" if not found)
        - email: str or null (email address if present in resume, null if not found)
        - phone: str or null (phone number if present in resume, null if not found)
        - skills: list[str]
        - experience_years: float
        - education: list[str]
        
        IMPORTANT RULES for the "skills" field:
        - Use lowercase canonical names (e.g. "python", "react", "node.js", "postgresql")
        - Do NOT include versioning (e.g. "python" not "python 3.11")
        - SORT the skills list alphabetically
        - Only include technical skills, tools, frameworks, and programming languages also include Soft skills, Core competencies where applicable
        - Be exhaustive — include every skill mentioned in the resume

        Resume Text:
        {text[:15000]}
        """

        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature = 0.0,
                seed = 67
            ),
        )

        try:
            data = json.loads(response.text)
        except json.JSONDecodeError as exc:
            raise ParserError("LLM returned invalid JSON") from exc

        return data
    
parser = ResumeParser()
