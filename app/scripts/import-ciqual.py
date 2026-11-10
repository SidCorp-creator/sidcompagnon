"""Generate Sid’Nutrition's local index from the official Ciqual 2025 XLSX."""
import argparse
import json
import re
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile

NAMESPACES = {"sheet": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
COLUMNS = ("K", "O", "Q", "R")  # Energy in kcal, protein, carbohydrates, fat.
SOURCE = "Anses. 2025. Table de composition nutritionnelle des aliments Ciqual"
SOURCE_URL = "https://doi.org/10.57745/RDMHWY"


def read_rows(path):
    with ZipFile(path) as archive:
        strings = ET.fromstring(archive.read("xl/sharedStrings.xml"))
        shared = ["".join(t.text or "" for t in s.findall(".//sheet:t", NAMESPACES)) for s in strings]
        with archive.open("xl/worksheets/sheet1.xml") as sheet:
            for _, row in ET.iterparse(sheet, events=("end",)):
                if not row.tag.endswith("}row"):
                    continue
                values = {}
                for cell in row:
                    value = cell.find("sheet:v", NAMESPACES)
                    if value is None:
                        continue
                    column = re.sub(r"\d", "", cell.attrib["r"])
                    values[column] = shared[int(value.text)] if cell.get("t") == "s" else value.text
                yield values
                row.clear()


def number(text):
    try:
        return float(text.replace(",", "."))
    except (AttributeError, ValueError):
        return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("xlsx", type=Path, help="Table Ciqual 2025_FR_2025_11_03.xlsx")
    args = parser.parse_args()
    rows = read_rows(args.xlsx)
    header = next(rows)
    if header.get("H") != "alim_nom_fr" or any(name not in header[col] for col, name in zip(
        COLUMNS, ("(kcal", "Protéines", "Glucides", "Lipides")
    )):
        parser.error("unexpected column layout")
    foods = []
    for row in rows:
        macros = [number(row.get(col)) for col in COLUMNS]
        if all(value is not None for value in macros):
            foods.append([row["G"], " ".join(row["H"].split()), *macros])
    target = Path(__file__).resolve().parents[2] / "site" / "ciqual-2025.json"
    target.write_text(json.dumps({"source": SOURCE, "url": SOURCE_URL, "foods": foods},
                                 ensure_ascii=False, separators=(",", ":")) + "\n")


if __name__ == "__main__":
    main()
