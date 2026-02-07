# GDELT Global Knowledge Graph (GKG) 2.1 - Field Reference

Complete reference for all 27 columns in the GDELT GKG 2.1 format.

**Source:** Official GDELT GKG 2.1 Codebook  
**Format:** Tab-separated values (despite .csv.zip filename)  
**Update Frequency:** Every 15 minutes

---

## Column 0: GKGRECORDID

**Description:** Globally unique identifier for each GKG record

**Format:** `YYYYMMDDHHMMSS-X` or `YYYYMMDDHHMMSS-TX`
- First part: Full date/time of the 15-minute update batch
- After dash: Sequential number for records in that batch
- "T" after dash: Indicates document was translated by GDELT Translingual

**Example:** `20260207080000-1234` or `20260207080000-T5678`

---

## Column 1: DATE

**Description:** Publication date of the news document

**Format:** `YYYYMMDDHHMMSS`

**Note:** Same for all rows in a single update file

**Example:** `20260207083000`

---

## Column 2: SourceCollectionIdentifier

**Description:** Numeric identifier for the source collection

**Format:** Integer

**Values:**
- `1` = WEB (open web, DocumentIdentifier is a URL)
- `2` = CITATIONONLY (broadcast/print, DocumentIdentifier is text citation)
- `3` = CORE (CORE archive, DocumentIdentifier is DOI)
- `4` = DTIC (DTIC archive)
- `5` = JSTOR (JSTOR archive)

**Example:** `1`

---

## Column 3: SourceCommonName

**Description:** Human-friendly identifier for the news source

**Format:** Text

**Example:** `cnn.com` or `bbc.co.uk`

---

## Column 4: DocumentIdentifier

**Description:** Unique external identifier for the source document

**Format:** Depends on SourceCollectionIdentifier
- If SourceCollectionIdentifier=1: Full URL
- If SourceCollectionIdentifier=2: Text citation
- If SourceCollectionIdentifier=3+: DOI or archive ID

**Example:** `https://www.nytimes.com/2026/02/07/world/article.html`

---

## Column 5: V1Counts

**Description:** Legacy counts field (V1 format)

**Format:** Semicolon-delimited blocks

**Note:** Deprecated in favor of V2Counts (Column 6)

---

## Column 6: V2Counts

**Description:** All counts mentioned in the document

**Format:** Semicolon-delimited blocks, pound-sign (#) separated sub-fields

**Sub-fields:**
- CountType (e.g., AFFECT, ARREST, KIDNAP, KILL, PROTEST, SEIZE, WOUND)
- Number (numeric value)
- ObjectType (what is being counted, e.g., "civilians", "protesters")
- Location (geographic reference if available)

**Example:** `KILL#50#militants#Baghdad;PROTEST#1000#students#Paris`

**Parseable:** Yes - extract count types and numbers

---

## Column 7: V1Themes

**Description:** Legacy themes field (V1 format)

**Format:** Semicolon-delimited list

**Note:** Deprecated in favor of V2Themes (Column 8)

---

## Column 8: V2Themes

**Description:** Semantic themes identified in the article

**Format:** Semicolon-delimited list of themes, with optional comma-separated offsets

**Theme Sources:**
- CRISISLEX taxonomy (prefix: `CRISISLEX_`)
- UN Global Pulse (prefix: `UNGP_`)
- World Bank (prefix: `WB_`)
- GDELT native themes (no prefix)

**Sub-fields (comma-separated):**
- ThemeName
- Offset (character position in document, optional)
- Length (length of text segment, optional)

**Example:** `TAX_FNCACT;WB_632_EDUCATION;CRISISLEX_CRISIS;UNGP_DISASTER`

**Parseable:** Yes - extract theme names by splitting on semicolons

---

## Column 9: V1Locations

**Description:** Legacy locations field (V1 format)

**Note:** Deprecated in favor of V2Locations (Column 10)

---

## Column 10: V1Persons

**Description:** Legacy persons field (V1 format)

**Note:** Deprecated in favor of V2Persons (Column 11)

---

## Column 11: V1Organizations

**Description:** Legacy organizations field (V1 format)

**Note:** Deprecated in favor of V2Organizations (Column 12)

---

## Column 12: V1Tone

**Description:** Legacy tone/sentiment field (V1 format)

**Note:** Deprecated in favor of V2Tone (Column 15)

---

## Column 13: V21Dates

**Description:** All dates mentioned in the document

**Format:** Semicolon-delimited list of dates with offsets

**Example:** `20260207,1523,8;20260115,2847,8`

**Parseable:** Yes - extract date values

---

## Column 14: V21GCAM

**Description:** Global Content Analysis Measures - emotions and themes

**Format:** Comma-delimited blocks with colon-separated key/value pairs

**Structure:** `DictionaryID.DimensionID:score`

**Note:** Only reports dimensions with matches (sparse format)

**Example:** `c1.1:45;c1.5:23;c2.8:67`

**Parseable:** Yes - extract dictionary dimensions and scores

---

## Column 15: V21ShareImg

**Description:** Social media sharing image URL (if available)

**Format:** URL or empty

**Example:** `https://example.com/image.jpg`

---

## Column 16: V21RelatedImages

**Description:** Related image URLs mentioned in article

**Format:** Semicolon-delimited URLs

**Example:** `https://cdn.example.com/photo1.jpg;https://cdn.example.com/photo2.jpg`

---

## Column 17: V21SocialImageEmbeds

**Description:** Embedded social media images

**Format:** Semicolon-delimited URLs

---

## Column 18: V21SocialVideoEmbeds

**Description:** Embedded social media videos

**Format:** Semicolon-delimited URLs

---

## Column 19: V21Quotations

**Description:** Direct quotations extracted from the article

**Format:** Semicolon-delimited quoted text with offsets

**Parseable:** Yes - extract quotation text

---

## Column 20: V21AllNames

**Description:** All proper names (persons, places, organizations combined)

**Format:** Semicolon-delimited list with character offsets

**Parseable:** Yes - extract all names

---

## Column 21: V21Amounts

**Description:** Monetary amounts and quantities mentioned

**Format:** Semicolon-delimited blocks with pound-sign separated sub-fields

**Sub-fields:**
- Amount (numeric value)
- Offset (character position)
- Type (currency or unit)

**Example:** `1000000#523#USD;500#1847#EUR`

**Parseable:** Yes - extract amounts and currencies

---

## Column 22: V21TranslationInfo

**Description:** Translation metadata (if document was translated)

**Format:** Language codes and confidence

**Example:** `srclc:es;eng:95`

---

## Column 23: V2Extras

**Description:** XML block with additional extracted metadata

**Format:** XML string

**Common sub-fields:**
- `<PAGE_LINKS>`: Hyperlinks found in article
- `<PAGE_AUTHORS>`: Author names
- `<PAGE_PUBDATE>`: Precise publication timestamp
- `<PAGE_TITLE>`: Article title
- `<PAGE_AMP_URL>`: AMP version URL
- `<PAGE_MOBILE_URL>`: Mobile version URL

**Parseable:** Yes - parse XML for specific fields

---

## V2 Enhanced Fields

The following V2 fields are typically found in columns 24-26 but their exact positions may vary. Consult actual data files to verify column indices.

### V2Persons

**Description:** All person names mentioned in the document

**Format:** Semicolon-delimited blocks, comma-separated sub-fields

**Sub-fields:**
- PersonName
- Offset (character position in document)
- Length (length of name in characters)

**Example:** `Joe Biden,234,9;Kamala Harris,567,13`

**Parseable:** Yes - extract person names (ignore offsets)

---

### V2Organizations

**Description:** All organizations/companies mentioned

**Format:** Semicolon-delimited blocks, comma-separated sub-fields

**Sub-fields:**
- OrganizationName
- Offset (character position in document)
- Length (length of name in characters)

**Example:** `United Nations,134,14;Apple Inc,789,9`

**Parseable:** Yes - extract organization names (ignore offsets)

---

### V2Locations

**Description:** All geocoded locations with coordinates

**Format:** Semicolon-delimited blocks, pound-sign (#) separated sub-fields

**Sub-fields:**
- LocationType (1=COUNTRY, 2=USSTATE, 3=USCITY, 4=WORLDCITY, 5=WORLDSTATE)
- LocationFullName (human-readable name)
- CountryCode (2-character FIPS10-4)
- ADM1Code (state/province code)
- ADM2Code (county/district code)
- Latitude (decimal degrees)
- Longitude (decimal degrees)
- FeatureID (unique geographic feature identifier)
- Offset (character position in document)

**Example:** `4#Paris#FR#A8#75#48.8566#2.3522#FR12345#892`

**Parseable:** Yes - extract location names, country codes, coordinates

---

### V2Tone

**Description:** Six core emotional dimensions of the document

**Format:** Comma-delimited numeric values

**Sub-fields (in order):**
1. Tone (average sentiment: -100 to +100, negative is bad, positive is good)
2. Positive Score (% of positive words, 0-100)
3. Negative Score (% of negative words, 0-100)
4. Polarity (absolute difference between positive and negative)
5. Activity Reference Density (% of active/action words)
6. Self/Group Reference Density (% of self-referential words)

**Example:** `-2.5,3.2,5.7,2.5,12.3,4.8`

**Parseable:** Yes - extract individual tone metrics

---

## Key Parseable Fields Summary

For news analysis, these are the most commonly extracted fields:

### Basic Metadata
- **Column 1:** DATE (publication date)
- **Column 3:** SourceCommonName (news outlet)
- **Column 4:** DocumentIdentifier (article URL)

### Content Analysis
- **Column 6:** V2Counts (deaths, protests, arrests)
- **Column 8:** V2Themes (article topics)
- **V2Persons:** People mentioned
- **V2Organizations:** Companies/agencies mentioned
- **V2Locations:** Places with coordinates
- **V2Tone:** Sentiment analysis

### Advanced
- **Column 14:** V21GCAM (detailed emotion analysis)
- **Column 19:** V21Quotations (direct quotes)
- **Column 21:** V21Amounts (monetary values)
- **Column 23:** V2Extras (XML with links, authors, title)

---

## Important Notes

1. Many fields use semicolon (`;`) as the primary delimiter between entries
2. Within each entry, pound signs (`#`) or commas (`,`) separate sub-fields
3. V1 fields (columns 5, 7, 9-12) are deprecated; use V2/V21 versions instead
4. Character offsets allow proximity analysis (e.g., which person near which location)
5. Empty fields are represented by empty strings (consecutive tabs)
6. The exact position of V2Persons, V2Organizations, V2Locations, and V2Tone may vary depending on the GKG version. Always verify with sample data.
