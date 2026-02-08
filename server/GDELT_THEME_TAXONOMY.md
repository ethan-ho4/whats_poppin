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
- `WB_133_INFORMATION_AND_COMMUNICATION_TECHNOLOGIES` - General ICT/tech
- `WB_678_DIGITAL_GOVERNMENT` - Digital government/e-government
- `WB_694_BROADCAST_AND_MEDIA` - Media and broadcasting technology
- `WB_286_TELECOMMUNICATIONS_AND_BROADBAND_ACCESS` - Telecom and internet access
- `WB_652_ICT_APPLICATIONS` - ICT applications
- `WB_667_ICT_INFRASTRUCTURE` - ICT infrastructure
- `WB_672_NETWORK_MANAGEMENT` - Network management
- `WB_2943_SWITCHES` - Network switches and routing
- `WB_1331_HEALTH_TECHNOLOGIES` - Medical and health technology
- `WB_1350_PHARMACEUTICALS` - Pharmaceutical technology

**Note:** While GDELT doesn't have specific "AI" or "machine learning" theme codes (the taxonomy predates mainstream AI), technology articles are tagged with the ICT themes above.

---

## 📱 Comprehensive Technology Themes

### Information & Communication Technology
- `WB_133_INFORMATION_AND_COMMUNICATION_TECHNOLOGIES` - General ICT/technology
- `WB_678_DIGITAL_GOVERNMENT` - E-government and digital public services
- `WB_694_BROADCAST_AND_MEDIA` - Media and broadcasting technology
- `WB_286_TELECOMMUNICATIONS_AND_BROADBAND_ACCESS` - Telecom and internet access
- `WB_652_ICT_APPLICATIONS` - ICT applications and software
- `WB_667_ICT_INFRASTRUCTURE` - ICT infrastructure and networks
- `WB_672_NETWORK_MANAGEMENT` - Network management and administration
- `WB_2943_SWITCHES` - Network switches and routing equipment
- `WB_669_SOFTWARE_INFRASTRUCTURE` - Software infrastructure
- `WB_2944_SERVERS` - Server infrastructure
- `WB_2945_DATABASE` - Database systems

### Cybersecurity & Digital Safety
- `WB_670_ICT_SECURITY` - ICT security and data protection
- `WB_2372_AUTHENTICATION_AND_AUTHORIZATION` - Authentication systems
- `CYBER_ATTACK` - Cyber attacks and hacking incidents
- `SURVEILLANCE` - Surveillance and monitoring
- `DATA_PRIVACY` - Data privacy concerns (if present in your data)

### Social Media & Digital Communication
- `MEDIA_SOCIAL` - Social media platforms
- `WB_662_SOCIAL_MEDIA` - Social media engagement
- `MEDIA_MSM` - Mainstream media
- `MEDIA_CENSORSHIP` - Media censorship

### Science & Innovation
- `SCIENCE` - Scientific research and development
- `SOC_INNOVATION` - Innovation and new developments
- `SOC_EMERGINGTECH` - Emerging technologies
- `WB_376_INNOVATION_TECHNOLOGY_AND_ENTREPRENEURSHIP` - Tech entrepreneurship

### Space & Satellites
- `WB_2120_SATELLITES` - Satellite technology

### Energy Technology
- `WB_525_RENEWABLE_ENERGY` - Renewable energy technology
- `ENV_SOLAR` - Solar energy
- `ENV_COAL` - Coal energy
- `ENV_NATURALGAS` - Natural gas

---

## 🌍 Comprehensive World Politics Themes

### Political Leadership & Government
- `LEADER` - Political leaders
- `TAX_FNCACT_PRESIDENT` - Presidents
- `TAX_FNCACT_PRIME_MINISTER` - Prime ministers
- `TAX_FNCACT_MINISTER` - Ministers
- `TAX_FNCACT_GOVERNOR` - Governors
- `TAX_FNCACT_MAYOR` - Mayors
- `TAX_FNCACT_KING` - Monarchs/kings
- `TAX_FNCACT_QUEEN` - Queens
- `TAX_FNCACT_PRINCE` - Princes
- `GENERAL_GOVERNMENT` - General government activities
- `GOV_LOCALGOV` - Local government

### Elections & Democracy
- `ELECTION` - Elections and voting
- `DEMOCRACY` - Democratic processes
- `TAX_FNCACT_CANDIDATE` - Political candidates
- `TAX_FNCACT_CANDIDATES` - Multiple candidates
- `TAX_POLITICAL_PARTY` - Political parties (general)
- `TAX_POLITICAL_PARTY_DEMOCRATIC_PARTY` - Democratic Party
- `TAX_POLITICAL_PARTY_DEMOCRAT` - Democrats
- `TAX_POLITICAL_PARTY_DEMOCRATS` - Democrats (plural)
- `TAX_POLITICAL_PARTY_REPUBLICAN` - Republican Party
- `TAX_POLITICAL_PARTY_REPUBLICANS` - Republicans (plural)

### Government Policy & Administration
- `EPU_POLICY` - Economic policy uncertainty
- `EPU_POLICY_GOVERNMENT` - Government policy
- `EPU_POLICY_LAW` - Law and legal policy
- `EPU_POLICY_POLICY` - General policy
- `USPEC_POLICY1` - Policy uncertainty
- `WB_696_PUBLIC_SECTOR_MANAGEMENT` - Public sector management
- `WB_723_PUBLIC_ADMINISTRATION` - Public administration
- `LEGISLATION` - Legislation and lawmaking
- `CONSTITUTIONAL` - Constitutional matters
- `WB_845_LEGAL_AND_REGULATORY_FRAMEWORK` - Legal/regulatory framework

### International Relations & Diplomacy
- `WB_2473_DIPLOMACY_AND_NEGOTIATIONS` - Diplomacy
- `WB_939_NEGOTIATION` - Negotiations
- `NEGOTIATIONS` - International negotiations
- `WB_1024_PUBLIC_INTERNATIONAL_LAW` - International law
- `WB_1026_TREATIES` - Treaties and agreements
- `ALLIANCE` - Political/military alliances
- `TAX_FNCACT_AMBASSADOR` - Ambassadors
- `TAX_FNCACT_DIPLOMATS` - Diplomats
- `TAX_FNCACT_FOREIGN_MINISTER` - Foreign ministers
- `SOVEREIGNTY` - National sovereignty

### Conflict & Security
- `WB_2432_FRAGILITY_CONFLICT_AND_VIOLENCE` - Conflict and fragility
- `WB_2433_CONFLICT_AND_VIOLENCE` - Violence and conflict
- `ARMEDCONFLICT` - Armed conflict
- `MILITARY` - Military operations
- `WB_2462_POLITICAL_VIOLENCE_AND_WAR` - Political violence/war
- `WB_2468_CONVENTIONAL_WAR` - Conventional warfare
- `WB_739_POLITICAL_VIOLENCE_AND_CIVIL_WAR` - Civil war
- `WB_2467_TERRORISM` - Terrorism
- `TERROR` - Terror attacks
- `WB_2490_NATIONAL_PROTECTION_AND_SECURITY` - National security
- `EPU_CATS_NATIONAL_SECURITY` - National security concerns
- `SECURITY_SERVICES` - Security services

### Peace & Conflict Resolution
- `WB_2470_PEACE_OPERATIONS_AND_CONFLICT_MANAGEMENT` - Peace operations
- `WB_2471_PEACEKEEPING` - Peacekeeping operations
- `WB_2482_RECONCILIATION` - Reconciliation efforts
- `CEASEFIRE` - Ceasefire agreements

### Governance & Corruption
- `WB_831_GOVERNANCE` - Governance systems
- `WB_832_ANTI_CORRUPTION` - Anti-corruption measures
- `WB_2024_ANTI_CORRUPTION_AUTHORITIES` - Anti-corruption authorities
- `WB_2019_ANTI_CORRUPTION_LEGISLATION` - Anti-corruption laws
- `WB_2020_BRIBERY_FRAUD_AND_COLLUSION` - Bribery and fraud
- `WB_2025_INVESTIGATION` - Investigations
- `WB_2026_PREVENTION` - Prevention measures
- `CORRUPTION` - Corruption
- `TRANSPARENCY` - Government transparency

### Political Ideology & Systems
- `IDEOLOGY` - Political ideology
- `SLFID_DICTATORSHIP` - Dictatorship
- `EXTREMISM` - Political extremism
- `TAX_FNCACT_COMMUNIST` - Communist ideology

### Human Rights & Civil Liberties
- `WB_2203_HUMAN_RIGHTS` - Human rights
- `SELF_IDENTIFIED_HUMAN_RIGHTS` - Human rights issues
- `HUMAN_RIGHTS_ABUSES` - Human rights violations
- `WB_2507_HUMAN_RIGHTS_ABUSES_AND_VIOLATIONS` - HR violations
- `WB_2519_RESPONSES_TO_HUMAN_RIGHTS_ABUSES` - Responses to abuses
- `UNGP_POLITICAL_FREEDOMS` - Political freedoms
- `UNGP_FREEDOM_FROM_DISCRIMINATION` - Freedom from discrimination
- `DISCRIMINATION` - Discrimination

### Migration & Refugees
- `IMMIGRATION` - Immigration
- `WB_2837_IMMIGRATION` - Immigration policy
- `EPU_CATS_MIGRATION_FEAR_MIGRATION` - Migration concerns
- `WB_2836_MIGRATION_POLICIES_AND_JOBS` - Migration policies
- `REFUGEES` - Refugee crises
- `CRISISLEX_T09_DISPLACEDRELOCATEDEVACUATED` - Displaced persons

### Protests & Civil Unrest
- `PROTEST` - Protests and demonstrations
- `TAX_FNCACT_DEMONSTRATORS` - Demonstrators
- `UNREST_BELLIGERENT` - Civil unrest
- `VIOLENT_UNREST` - Violent unrest
- `POLITICAL_TURMOIL` - Political turmoil
- `REBELLION` - Rebellions
- `INSURGENCY` - Insurgencies

---

## ⚽ Comprehensive Sports Themes

### Sports Infrastructure & Organizations
- `SOC_SPORTS` - General sports (if present)
- `SPORTS_OLYMPICS` - Olympic Games (if present)
- `SPORTS_WORLDCUP` - World Cup events (if present)

### Common Sports Terms
- `TAX_FNCACT_CHAMPION` - Champions
- `TAX_FNCACT_COACH` - Coaches (if present)
- `TAX_FNCACT_ATHLETE` - Athletes (if present)
- `COMPETITION` - Sports competitions (if present)
- `TOURNAMENT` - Tournaments (if present)

**Note:** GDELT's theme taxonomy is less comprehensive for sports compared to politics and technology. Sports coverage is often captured through:
- Person names (athletes, coaches)
- Location names (stadiums, cities hosting events)
- General themes like `TAX_FNCACT_CHAMPION`
- Organization names extracted separately

For sports news, you may need to rely more on:
1. **Source filtering** - Sports news websites
2. **Title keywords** - Look for sport names in titles
3. **Person extraction** - Athletes mentioned in V2Persons field

---

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
