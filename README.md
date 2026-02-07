# Global News Translation Pipeline

This project implements a pipeline to fetch **all global news** from the last hour and **translate** it into English.

## Files

- `main.py`: The entry point script. Runs the pipeline.
- `gdelt_client.py`: The client library for interacting with the GDELT API.
- `global_news_translated.csv`: Valid output file containing the translated news.

## Usage

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run Pipeline**:
   ```bash
   python main.py
   ```

   **Options**:
   - `--limit [number]`: Specify the number of articles to retrieve (default: 100).
     ```bash
     python main.py --limit 500
     ```

## Output

The script saves the results to `global_news_translated.csv` with the following columns:
- `seendate`
- `title` (Translated English)
- `url`
- `sourcecountry`
- `language`
