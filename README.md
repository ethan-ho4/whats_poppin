# Global News Mass Pipeline

This project implements a pipeline to **bulk download all new global news** every 15 minutes as it is released by GDELT.

## How it works

1.  **Monitors**: Checks the GDELT 2.0 Master File List every minute.
2.  **Downloads**: When a new 15-minute update is released (containing ~2k-5k articles), it downloads the zip file directly.
3.  **Extracts**: It processes the Global Knowledge Graph (GKG) file to extract news metadata (Source, Tone, Persons, Organizations).
4.  **Updates**: It appends *everything* to a single master CSV file: `15_mass.csv`.

## Usage

1.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Run the Pipeline**:
    ```bash
    python main.py
    ```
    Leave this running in the background.

## Output

The file `15_mass.csv` will grow continuously. Columns include:
- `date`
- `source_name`
- `url`
- `tone`
- `persons`
- `organizations`
- `locations`
