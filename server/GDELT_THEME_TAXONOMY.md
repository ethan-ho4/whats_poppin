# GDELT Theme Taxonomy Reference Guide

This document explains the preset taxonomies used by GDELT's Natural Language Processing (NLP) system to categorize news articles.

## Overview

GDELT processes millions of news articles daily and automatically tags them with **over 2,500 predefined theme codes** from established taxonomies. These themes are detected through NLP analysis and represent topics, entities, and concepts mentioned in articles.

**Key Point:** These themes are **preset and cannot be customized**. GDELT assigns them on their end before you download the data.

---

## Theme Taxonomy Prefixes

### 1. **TAX_** - GDELT Native Taxonomy
**Source:** GDELT's internal classification system  
**Count:** ~300+ themes  
**Purpose:** General categorization of entities, events, and topics

#### Common Categories:
- **TAX_DISEASE_*** - Disease and health conditions
  - `TAX_DISEASE_INFECTION` - Infectious diseases (COVID, flu, etc.)
  - `TAX_DISEASE_INFLUENZA` - Influenza/flu
  - `TAX_DISEASE_PNEUMONIA` - Pneumonia
  - `TAX_DISEASE_TUBERCULOSIS` - Tuberculosis
  - `TAX_DISEASE_OBESITY` - Obesity

- **TAX_FNCACT_*** - Functional actors (roles/occupations)
  - `TAX_FNCACT_MAYOR` - Mayors
  - `TAX_FNCACT_PRESIDENT` - Presidents
  - `TAX_FNCACT_POLICE` - Police officers
  - `TAX_FNCACT_DOCTORS` - Doctors
  - `TAX_FNCACT_STUDENTS` - Students

- **TAX_ETHNICITY_*** - Ethnic groups and nationalities
  - `TAX_ETHNICITY_NORWEGIAN` - Norwegian people
  - `TAX_ETHNICITY_GERMAN` - German people
  - `TAX_ETHNICITY_ARAB` - Arab people

- **TAX_WORLDLANGUAGES_*** - Languages
  - `TAX_WORLDLANGUAGES_SPANISH` - Spanish language
  - `TAX_WORLDLANGUAGES_RUSSIAN` - Russian language

- **TAX_WORLDMAMMALS_*** - Animals
  - `TAX_WORLDMAMMALS_SHEEP` - Sheep
  - `TAX_WORLDMAMMALS_DOG` - Dogs

- **TAX_POLITICAL_PARTY_*** - Political parties
  - `TAX_POLITICAL_PARTY_DEMOCRATS` - Democratic Party
  - `TAX_POLITICAL_PARTY_REPUBLICANS` - Republican Party

- **TAX_ECON_PRICE** - Economic pricing mentions
- **TAX_WEAPONS_*** - Weapons and military equipment

---

### 2. **WB_** - World Bank Topical Taxonomy
**Source:** World Bank Group  
**Count:** 2,198+ themes  
**Purpose:** Economic development, social issues, infrastructure, governance

#### Format:
`WB_[NUMBER]_[DESCRIPTION]`
- Number: Unique identifier (e.g., 632, 678)
- Description: Human-readable label

#### Major Categories:

**Agriculture & Food Security**
- `WB_435_AGRICULTURE_AND_FOOD_SECURITY`
- `WB_1979_NATURAL_RESOURCE_MANAGEMENT`

**Education**
- `WB_470_EDUCATION`
- `WB_632_EDUCATION` (alternate code)
- `WB_1467_EDUCATION_FOR_ALL`

**Health**
- `WB_635_PUBLIC_HEALTH`
- `WB_1406_DISEASES`
- `WB_1427_NON_COMMUNICABLE_DISEASE_AND_INJURY`
- `WB_1419_TUBERCULOSIS`

**Technology & Digital**
- `WB_133_INFORMATION_AND_COMMUNICATION_TECHNOLOGIES`
- `WB_678_DIGITAL_GOVERNMENT`
- `WB_694_BROADCAST_AND_MEDIA`

**Governance & Law**
- `WB_696_PUBLIC_SECTOR_MANAGEMENT`
- `WB_840_JUSTICE`
- `WB_1024_PUBLIC_INTERNATIONAL_LAW`

**Infrastructure**
- `WB_135_TRANSPORT`
- `WB_137_WATER`
- `WB_165_AIR_TRANSPORT`
- `WB_166_RAILWAYS`

**Economic Policy**
- `WB_439_MACROECONOMIC_AND_STRUCTURAL_POLICIES`
- `WB_442_INFLATION`
- `WB_1121_TAXATION`

**Social Development**
- `WB_615_GENDER`
- `WB_742_YOUTH_AND_GENDER_BASED_VIOLENCE`
- `WB_2670_JOBS`

**Conflict & Security**
- `WB_2432_FRAGILITY_CONFLICT_AND_VIOLENCE`
- `WB_2433_CONFLICT_AND_VIOLENCE`
- `WB_2467_TERRORISM`

---

### 3. **CRISISLEX_** - Crisis and Disaster Response
**Source:** CrisisLex.org initiative  
**Count:** ~50+ themes  
**Purpose:** Crisis events, disasters, emergency response (originally designed for social media)

#### Format:
- `CRISISLEX_C##_*` - Crisis categories
- `CRISISLEX_T##_*` - Crisis types/impacts
- `CRISISLEX_O##_*` - Crisis origins

#### Common Themes:

**General Crisis**
- `CRISISLEX_CRISISLEXREC` - General crisis/disaster mention
- `CRISISLEX_CRISIS` - Crisis event

**People Impact (T-series)**
- `CRISISLEX_T02_INJURED` - Injured people
- `CRISISLEX_T03_DEAD` - Fatalities
- `CRISISLEX_T08_MISSINGFOUNDTRAPPEDPEOPLE` - Missing/trapped people
- `CRISISLEX_T09_DISPLACEDRELOCATEDEVACUATED` - Displaced/evacuated people
- `CRISISLEX_T11_UPDATESSYMPATHY` - Updates and sympathy messages

**Infrastructure & Services (C-series)**
- `CRISISLEX_C01_CHILDREN_AND_EDUCATION` - Children and education in crisis
- `CRISISLEX_C03_WELLBEING_HEALTH` - Health and wellbeing
- `CRISISLEX_C04_LOGISTICS_TRANSPORT` - Logistics and transport
- `CRISISLEX_C07_SAFETY` - Safety concerns
- `CRISISLEX_C08_TELECOM` - Telecommunications

**Crisis Origins (O-series)**
- `CRISISLEX_O01_WEATHER` - Weather-related crisis

---

### 4. **UNGP_** - United Nations Global Pulse
**Source:** UN My World Survey / UN Guiding Principles  
**Count:** ~30+ themes  
**Purpose:** Human rights, sustainable development, global priorities

#### Common Themes:

**Environment**
- `UNGP_FORESTS_RIVERS_OCEANS` - Natural resources and ecosystems
- `UNGP_CLIMATE_CHANGE_ACTION` - Climate action

**Social Issues**
- `UNGP_EDUCATION` - Good education
- `UNGP_CLEAN_WATER_SANITATION` - Clean water and sanitation
- `UNGP_PHONE_INTERNET_ACCESS_SLOW` - Digital access issues
- `UNGP_POLITICAL_FREEDOMS` - Political freedoms and rights

**Crime & Violence**
- `UNGP_CRIME_VIOLENCE` - Crime and violence

---

### 5. **No Prefix** - GDELT Core Themes
**Source:** GDELT native themes  
**Purpose:** General news topics and events

#### Common Themes:

**Natural Disasters**
- `NATURAL_DISASTER_ICE` - Ice storms, freezing events
- `NATURAL_DISASTER_FLOODS` - Flooding
- `NATURAL_DISASTER_AVALANCHE` - Avalanches
- `NATURAL_DISASTER_VOLCANIC` - Volcanic activity
- `NATURAL_DISASTER_CYCLONES` - Hurricanes, typhoons

**Politics & Government**
- `ELECTION` - Elections
- `LEADER` - Political leaders
- `CONSTITUTIONAL` - Constitutional matters
- `GENERAL_GOVERNMENT` - Government activities
- `EPU_POLICY_*` - Economic Policy Uncertainty themes
  - `EPU_POLICY_GOVERNMENT` - Government policy
  - `EPU_POLICY_TAX` - Tax policy
  - `EPU_CATS_TAXES` - Tax categories

**Crime & Justice**
- `SOC_GENERALCRIME` - General crime
- `CRIME_ILLEGAL_DRUGS` - Drug crimes
- `DRUG_TRADE` - Drug trafficking
- `KIDNAP` - Kidnapping
- `KILL` - Killings/murders
- `ARREST` - Arrests

**Conflict & Military**
- `ARMEDCONFLICT` - Armed conflict
- `MILITARY` - Military activities
- `DRONES` - Drone usage
- `CEASEFIRE` - Ceasefire agreements

**Health**
- `GENERAL_HEALTH` - General health topics
- `MEDICAL` - Medical care
- `DISABILITY` - Disability issues

**Economy**
- `ECON_TAXATION` - Taxation
- `ECON_INFLATION` - Inflation
- `ECON_HOUSING_PRICES` - Housing prices
- `ECON_STOCKMARKET` - Stock market
- `ECON_COST_OF_LIVING` - Cost of living

**Social Issues**
- `EDUCATION` - Education
- `PROTEST` - Protests
- `DISCRIMINATION` - Discrimination
- `GENDER_VIOLENCE` - Gender-based violence
- `RAPE` - Sexual assault

**Infrastructure**
- `TRAFFIC` - Traffic issues
- `PUBLIC_TRANSPORT` - Public transportation
- `BORDER` - Border issues
- `MARITIME` - Maritime/naval

**Disasters & Accidents**
- `DISASTER_FIRE` - Fires
- `MANMADE_DISASTER_IMPLIED` - Human-caused disasters
- `EVACUATION` - Evacuations

---

## Understanding Theme Repetition

### Why Themes Repeat in Your CSV

GDELT records **every position** where a theme appears in an article:

**Example:**
If "NATURAL_DISASTER_ICE" is mentioned at character positions 100, 500, and 900 in an article, the raw GDELT data contains:
```
NATURAL_DISASTER_ICE,100;NATURAL_DISASTER_ICE,500;NATURAL_DISASTER_ICE,900
```

**Your current parsing** extracts all occurrences, leading to duplicates:
```csv
themes: NATURAL_DISASTER_ICE;NATURAL_DISASTER_ICE;NATURAL_DISASTER_ICE
```

### Solution: Deduplication

To clean this up, you should deduplicate themes while preserving order:

```python
def parse_v2_themes(themes_str):
    themes = []
    seen = set()
    for theme_block in themes_str.split(';'):
        if theme_block:
            theme_name = theme_block.split(',')[0]  # Remove offset
            if theme_name not in seen:
                themes.append(theme_name)
                seen.add(theme_name)
    return themes
```

This gives you:
```csv
themes: NATURAL_DISASTER_ICE
```

---

## Limitations & Customization

### What You CANNOT Do:
❌ Create custom theme codes  
❌ Modify GDELT's theme detection  
❌ Make themes more specific  
❌ Change theme granularity  

### What You CAN Do:
✅ **Filter themes** - Only keep certain prefixes (e.g., only `WB_` for economic news)  
✅ **Deduplicate** - Remove repeated instances  
✅ **Map to custom categories** - Create your own groupings:
```python
theme_mapping = {
    'NATURAL_DISASTER_ICE': 'Weather',
    'NATURAL_DISASTER_FLOODS': 'Weather',
    'ELECTION': 'Politics',
    'WB_632_EDUCATION': 'Education'
}
```
✅ **Run your own NLP** - Analyze article titles/content yourself for more granular categorization

---

## Example: Interpreting Your Data

Looking at row 2 from your CSV:
```csv
themes: NATURAL_DISASTER_ICE;NATURAL_DISASTER_ICE;TAX_WORLDMAMMALS_SHEEP;TAX_DISEASE_INFECTION;MARITIME
```

**Interpretation:**
- `NATURAL_DISASTER_ICE` (appears 2x) - Article discusses ice-related weather events
- `TAX_WORLDMAMMALS_SHEEP` - Sheep are mentioned
- `TAX_DISEASE_INFECTION` - Infectious disease mentioned
- `MARITIME` - Maritime/naval context

**After deduplication:**
```csv
themes: NATURAL_DISASTER_ICE;TAX_WORLDMAMMALS_SHEEP;TAX_DISEASE_INFECTION;MARITIME
```

---

## Resources

- **GDELT Documentation:** https://www.gdeltproject.org/data.html
- **GKG 2.0 Codebook:** https://blog.gdeltproject.org/gdelt-2-0-our-global-world-in-realtime/
- **World Bank Taxonomy:** 2,198 themes covering development topics
- **CrisisLex:** https://crisislex.org/
- **Theme Lookup File:** Available from GDELT for advanced users

---

## Summary

GDELT's themes are **preset taxonomies** that cannot be customized. They come from:
1. **TAX_** - GDELT's internal taxonomy (diseases, occupations, ethnicities)
2. **WB_** - World Bank (2,198 development/economic themes)
3. **CRISISLEX_** - Crisis response (disasters, emergencies)
4. **UNGP_** - UN Global Pulse (human rights, sustainability)
5. **No prefix** - GDELT core themes (disasters, politics, crime)

To make your data more readable, **deduplicate themes** to remove repeated instances from the same article.
