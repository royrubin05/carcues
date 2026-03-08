// ═══════════════════════════════════════════════════════════
// Vehicle Data Service — Curated Exotic Car Database
// With Production Numbers for Rarity Scoring
// ═══════════════════════════════════════════════════════════
//
// Production numbers sourced from manufacturer data, automotive
// encyclopedias, and verified enthusiast databases.
//
// `produced` = total units manufactured across all production years
//   null = mass-produced / production numbers not meaningful
// ═══════════════════════════════════════════════════════════

// ──── Curated Car Database ────
const EXOTIC_DATABASE = {
    // ═══ HYPERCARS ═══
    'Bugatti': {
        models: [
            { name: 'Chiron', years: [2016, 2026], produced: 500 },
            { name: 'Chiron Sport', years: [2019, 2022], produced: 60 },
            { name: 'Chiron Super Sport', years: [2022, 2025], produced: 30 },
            { name: 'Chiron Pur Sport', years: [2021, 2023], produced: 60 },
            { name: 'Divo', years: [2019, 2021], produced: 40 },
            { name: 'Centodieci', years: [2022, 2024], produced: 10 },
            { name: 'Bolide', years: [2024, 2026], produced: 40 },
            { name: 'Mistral', years: [2024, 2026], produced: 99 },
            { name: 'Veyron', years: [2005, 2015], produced: 450 },
            { name: 'Veyron Super Sport', years: [2010, 2015], produced: 48 },
            { name: 'Veyron Grand Sport', years: [2008, 2015], produced: 150 },
            { name: 'EB110', years: [1991, 1995], produced: 139 },
            { name: 'Tourbillon', years: [2026, 2027], produced: 250 },
        ],
    },
    'Pagani': {
        models: [
            { name: 'Huayra', years: [2012, 2020], produced: 100 },
            { name: 'Huayra BC', years: [2016, 2020], produced: 20 },
            { name: 'Huayra Roadster', years: [2017, 2020], produced: 100 },
            { name: 'Huayra Roadster BC', years: [2020, 2022], produced: 40 },
            { name: 'Huayra R', years: [2021, 2024], produced: 30 },
            { name: 'Utopia', years: [2023, 2027], produced: 99 },
            { name: 'Zonda', years: [1999, 2019], produced: 140 },
            { name: 'Zonda F', years: [2005, 2007], produced: 25 },
            { name: 'Zonda R', years: [2007, 2012], produced: 15 },
            { name: 'Zonda Cinque', years: [2009, 2010], produced: 5 },
            { name: 'Zonda Revolucion', years: [2013, 2014], produced: 5 },
        ],
    },
    'Koenigsegg': {
        models: [
            { name: 'Jesko', years: [2022, 2027], produced: 125 },
            { name: 'Jesko Absolut', years: [2022, 2027], produced: 125 },
            { name: 'Gemera', years: [2024, 2027], produced: 300 },
            { name: 'CC850', years: [2024, 2027], produced: 70 },
            { name: 'Regera', years: [2016, 2021], produced: 80 },
            { name: 'Agera', years: [2011, 2018], produced: 25 },
            { name: 'Agera R', years: [2011, 2014], produced: 18 },
            { name: 'Agera RS', years: [2015, 2018], produced: 25 },
            { name: 'Agera One:1', years: [2014, 2015], produced: 7 },
            { name: 'CCX', years: [2006, 2010], produced: 49 },
            { name: 'CCXR', years: [2008, 2010], produced: 6 },
            { name: 'CCR', years: [2004, 2006], produced: 14 },
            { name: 'CC8S', years: [2002, 2004], produced: 6 },
        ],
    },
    'Rimac': {
        models: [
            { name: 'Nevera', years: [2021, 2027], produced: 150 },
            { name: 'Concept One', years: [2013, 2015], produced: 8 },
            { name: 'Concept S', years: [2016, 2017], produced: 2 },
        ],
    },
    'SSC': {
        models: [
            { name: 'Tuatara', years: [2020, 2025], produced: 100 },
            { name: 'Ultimate Aero', years: [2006, 2013], produced: 24 },
        ],
    },
    'Hennessey': {
        models: [
            { name: 'Venom F5', years: [2021, 2027], produced: 24 },
            { name: 'Venom GT', years: [2012, 2017], produced: 13 },
        ],
    },

    // ═══ SUPERCARS ═══
    'Ferrari': {
        models: [
            { name: 'SF90 Stradale', years: [2020, 2027], produced: null },
            { name: 'SF90 Spider', years: [2021, 2027], produced: null },
            { name: '296 GTB', years: [2022, 2027], produced: null },
            { name: '296 GTS', years: [2023, 2027], produced: null },
            { name: 'F80', years: [2025, 2027], produced: 799 },
            { name: 'Roma', years: [2020, 2027], produced: null },
            { name: 'Roma Spider', years: [2023, 2027], produced: null },
            { name: '812 Superfast', years: [2017, 2023], produced: null },
            { name: '812 GTS', years: [2020, 2023], produced: null },
            { name: '812 Competizione', years: [2021, 2023], produced: 999 },
            { name: 'Purosangue', years: [2023, 2027], produced: null },
            { name: 'Daytona SP3', years: [2022, 2025], produced: 599 },
            { name: 'F8 Tributo', years: [2019, 2022], produced: null },
            { name: 'F8 Spider', years: [2019, 2022], produced: null },
            { name: '488 GTB', years: [2015, 2019], produced: null },
            { name: '488 Spider', years: [2015, 2019], produced: null },
            { name: '488 Pista', years: [2018, 2020], produced: 3500 },
            { name: '458 Italia', years: [2009, 2015], produced: null },
            { name: '458 Spider', years: [2011, 2015], produced: null },
            { name: '458 Speciale', years: [2013, 2015], produced: 3000 },
            { name: 'LaFerrari', years: [2013, 2016], produced: 499 },
            { name: 'LaFerrari Aperta', years: [2016, 2018], produced: 210 },
            { name: 'GTC4Lusso', years: [2016, 2020], produced: null },
            { name: 'Portofino', years: [2018, 2023], produced: null },
            { name: 'Portofino M', years: [2021, 2023], produced: null },
            { name: 'California', years: [2008, 2017], produced: null },
            { name: 'California T', years: [2014, 2017], produced: null },
            { name: 'FF', years: [2011, 2016], produced: null },
            { name: '599 GTB', years: [2006, 2012], produced: null },
            { name: '599 GTO', years: [2010, 2011], produced: 599 },
            { name: 'F430', years: [2004, 2009], produced: null },
            { name: 'F430 Scuderia', years: [2007, 2009], produced: null },
            { name: '360 Modena', years: [1999, 2005], produced: null },
            { name: '360 Spider', years: [2000, 2005], produced: null },
            { name: '360 Challenge Stradale', years: [2003, 2005], produced: 1288 },
            { name: 'F50', years: [1995, 1997], produced: 349 },
            { name: 'F40', years: [1987, 1992], produced: 1315 },
            { name: '288 GTO', years: [1984, 1987], produced: 272 },
            { name: 'Enzo', years: [2002, 2004], produced: 400 },
            { name: 'Testarossa', years: [1984, 1996], produced: 7177 },
            { name: '512 TR', years: [1991, 1994], produced: 2261 },
            { name: 'Monza SP1', years: [2019, 2020], produced: 499 },
            { name: 'Monza SP2', years: [2019, 2020], produced: 499 },
        ],
    },
    'Lamborghini': {
        models: [
            { name: 'Revuelto', years: [2024, 2027], produced: null },
            { name: 'Temerario', years: [2025, 2027], produced: null },
            { name: 'Aventador', years: [2011, 2022], produced: 11465 },
            { name: 'Aventador S', years: [2017, 2020], produced: null },
            { name: 'Aventador SVJ', years: [2018, 2022], produced: 963 },
            { name: 'Aventador Ultimae', years: [2021, 2022], produced: 600 },
            { name: 'Huracan', years: [2014, 2024], produced: null },
            { name: 'Huracan Performante', years: [2017, 2020], produced: null },
            { name: 'Huracan STO', years: [2021, 2023], produced: null },
            { name: 'Huracan Tecnica', years: [2022, 2024], produced: null },
            { name: 'Huracan Sterrato', years: [2023, 2024], produced: 1499 },
            { name: 'Urus', years: [2018, 2027], produced: null },
            { name: 'Urus Performante', years: [2023, 2027], produced: null },
            { name: 'Urus SE', years: [2025, 2027], produced: null },
            { name: 'Gallardo', years: [2003, 2013], produced: 14022 },
            { name: 'Gallardo Superleggera', years: [2007, 2008], produced: null },
            { name: 'Murcielago', years: [2001, 2010], produced: 4099 },
            { name: 'Murcielago SV', years: [2009, 2010], produced: 350 },
            { name: 'Diablo', years: [1990, 2001], produced: 2903 },
            { name: 'Countach', years: [1974, 1990], produced: 1983 },
            { name: 'Countach LPI 800-4', years: [2022, 2023], produced: 112 },
            { name: 'Miura', years: [1966, 1973], produced: 764 },
            { name: 'Sian', years: [2020, 2021], produced: 63 },
            { name: 'Centenario', years: [2016, 2017], produced: 40 },
            { name: 'Veneno', years: [2014, 2015], produced: 9 },
        ],
    },
    'McLaren': {
        models: [
            { name: 'W1', years: [2025, 2027], produced: 399 },
            { name: '750S', years: [2023, 2027], produced: null },
            { name: '750S Spider', years: [2023, 2027], produced: null },
            { name: 'Artura', years: [2022, 2027], produced: null },
            { name: 'Artura Spider', years: [2024, 2027], produced: null },
            { name: '720S', years: [2017, 2023], produced: null },
            { name: '720S Spider', years: [2019, 2023], produced: null },
            { name: '765LT', years: [2020, 2022], produced: 765 },
            { name: '765LT Spider', years: [2021, 2022], produced: 765 },
            { name: '570S', years: [2015, 2021], produced: null },
            { name: '570GT', years: [2016, 2020], produced: null },
            { name: '600LT', years: [2018, 2020], produced: 1000 },
            { name: 'GT', years: [2019, 2023], produced: null },
            { name: 'Elva', years: [2021, 2022], produced: 149 },
            { name: 'Speedtail', years: [2019, 2021], produced: 106 },
            { name: 'Senna', years: [2018, 2020], produced: 500 },
            { name: 'Senna GTR', years: [2019, 2020], produced: 75 },
            { name: 'P1', years: [2013, 2015], produced: 375 },
            { name: '650S', years: [2014, 2017], produced: null },
            { name: 'MP4-12C', years: [2011, 2014], produced: null },
            { name: 'F1', years: [1992, 1998], produced: 106 },
            { name: 'Solus GT', years: [2023, 2024], produced: 25 },
        ],
    },
    'Porsche': {
        models: [
            { name: '911 Carrera', years: [1964, 2027], produced: null },
            { name: '911 Carrera S', years: [2004, 2027], produced: null },
            { name: '911 Carrera T', years: [2018, 2027], produced: null },
            { name: '911 Carrera GTS', years: [2010, 2027], produced: null },
            { name: '911 Turbo', years: [1975, 2027], produced: null },
            { name: '911 Turbo S', years: [1997, 2027], produced: null },
            { name: '911 GT3', years: [1999, 2027], produced: null },
            { name: '911 GT3 RS', years: [2003, 2027], produced: null },
            { name: '911 GT3 Touring', years: [2018, 2027], produced: null },
            { name: '911 GT2 RS', years: [2010, 2023], produced: 1000 },
            { name: '911 Dakar', years: [2023, 2025], produced: 2500 },
            { name: '911 Sport Classic', years: [2022, 2023], produced: 1250 },
            { name: '911 S/T', years: [2024, 2025], produced: 1963 },
            { name: '911 Targa', years: [1967, 2027], produced: null },
            { name: '918 Spyder', years: [2013, 2015], produced: 918 },
            { name: 'Carrera GT', years: [2003, 2006], produced: 1270 },
            { name: '718 Cayman', years: [2016, 2025], produced: null },
            { name: '718 Cayman GT4', years: [2015, 2025], produced: null },
            { name: '718 Cayman GT4 RS', years: [2022, 2025], produced: null },
            { name: '718 Boxster', years: [2016, 2025], produced: null },
            { name: '718 Boxster Spyder', years: [2019, 2025], produced: null },
            { name: 'Taycan', years: [2020, 2027], produced: null },
            { name: 'Taycan Turbo', years: [2020, 2027], produced: null },
            { name: 'Taycan Turbo S', years: [2020, 2027], produced: null },
            { name: 'Taycan Turbo GT', years: [2024, 2027], produced: null },
            { name: 'Cayenne', years: [2002, 2027], produced: null },
            { name: 'Cayenne Turbo GT', years: [2022, 2027], produced: null },
            { name: 'Cayenne Coupe', years: [2019, 2027], produced: null },
            { name: 'Macan', years: [2014, 2027], produced: null },
            { name: 'Panamera', years: [2009, 2027], produced: null },
            { name: 'Panamera Turbo S', years: [2017, 2027], produced: null },
        ],
    },
    'Aston Martin': {
        models: [
            { name: 'Valkyrie', years: [2022, 2025], produced: 150 },
            { name: 'Valhalla', years: [2025, 2027], produced: 999 },
            { name: 'Vanquish', years: [2024, 2027], produced: null },
            { name: 'DB12', years: [2024, 2027], produced: null },
            { name: 'DB11', years: [2016, 2023], produced: null },
            { name: 'DB11 AMR', years: [2018, 2023], produced: null },
            { name: 'DBS Superleggera', years: [2018, 2023], produced: null },
            { name: 'Vantage', years: [2018, 2027], produced: null },
            { name: 'Vantage Roadster', years: [2020, 2027], produced: null },
            { name: 'V12 Vantage', years: [2022, 2024], produced: 333 },
            { name: 'DBX', years: [2020, 2027], produced: null },
            { name: 'DBX707', years: [2022, 2027], produced: null },
            { name: 'One-77', years: [2009, 2012], produced: 77 },
            { name: 'Vulcan', years: [2015, 2016], produced: 24 },
            { name: 'DB9', years: [2003, 2016], produced: null },
            { name: 'DB10', years: [2015, 2015], produced: 10 },
            { name: 'V8 Vantage', years: [2005, 2017], produced: null },
            { name: 'Rapide', years: [2010, 2020], produced: null },
            { name: 'Victor', years: [2020, 2021], produced: 1 },
        ],
    },

    // ═══ SPORTS / PERFORMANCE ═══
    'Lotus': {
        models: [
            { name: 'Emira', years: [2022, 2027], produced: null },
            { name: 'Evija', years: [2024, 2027], produced: 130 },
            { name: 'Eletre', years: [2023, 2027], produced: null },
            { name: 'Emeya', years: [2024, 2027], produced: null },
            { name: 'Evora', years: [2009, 2021], produced: null },
            { name: 'Evora GT', years: [2020, 2021], produced: null },
            { name: 'Elise', years: [1996, 2021], produced: null },
            { name: 'Exige', years: [2000, 2021], produced: null },
            { name: 'Esprit', years: [1976, 2004], produced: null },
        ],
    },
    'Maserati': {
        models: [
            { name: 'MC20', years: [2021, 2027], produced: null },
            { name: 'MC20 Cielo', years: [2023, 2027], produced: null },
            { name: 'GranTurismo', years: [2007, 2027], produced: null },
            { name: 'GranTurismo Trofeo', years: [2023, 2027], produced: null },
            { name: 'GranCabrio', years: [2010, 2027], produced: null },
            { name: 'Grecale', years: [2022, 2027], produced: null },
            { name: 'Ghibli', years: [2013, 2023], produced: null },
            { name: 'Ghibli Trofeo', years: [2021, 2023], produced: null },
            { name: 'Levante', years: [2016, 2023], produced: null },
            { name: 'Quattroporte', years: [2003, 2023], produced: null },
            { name: 'MC12', years: [2004, 2005], produced: 62 },
        ],
    },
    'Alfa Romeo': {
        models: [
            { name: '33 Stradale', years: [2024, 2026], produced: 33 },
            { name: 'Giulia Quadrifoglio', years: [2016, 2027], produced: null },
            { name: 'Giulia', years: [2016, 2027], produced: null },
            { name: 'Stelvio Quadrifoglio', years: [2018, 2027], produced: null },
            { name: 'Stelvio', years: [2017, 2027], produced: null },
            { name: 'Tonale', years: [2023, 2027], produced: null },
            { name: '4C', years: [2013, 2020], produced: null },
            { name: '4C Spider', years: [2015, 2020], produced: null },
            { name: '8C Competizione', years: [2007, 2010], produced: 500 },
        ],
    },

    // ═══ LUXURY ═══
    'Rolls-Royce': {
        models: [
            { name: 'Spectre', years: [2024, 2027], produced: null },
            { name: 'Phantom', years: [2003, 2027], produced: null },
            { name: 'Ghost', years: [2010, 2027], produced: null },
            { name: 'Ghost Black Badge', years: [2021, 2027], produced: null },
            { name: 'Cullinan', years: [2018, 2027], produced: null },
            { name: 'Cullinan Black Badge', years: [2020, 2027], produced: null },
            { name: 'Wraith', years: [2013, 2023], produced: null },
            { name: 'Dawn', years: [2015, 2023], produced: null },
        ],
    },
    'Bentley': {
        models: [
            { name: 'Continental GT', years: [2003, 2027], produced: null },
            { name: 'Continental GT Speed', years: [2012, 2027], produced: null },
            { name: 'Continental GTC', years: [2006, 2027], produced: null },
            { name: 'Flying Spur', years: [2005, 2027], produced: null },
            { name: 'Flying Spur Speed', years: [2021, 2027], produced: null },
            { name: 'Bentayga', years: [2016, 2027], produced: null },
            { name: 'Bentayga Speed', years: [2019, 2027], produced: null },
            { name: 'Batur', years: [2024, 2026], produced: 18 },
            { name: 'Bacalar', years: [2021, 2022], produced: 12 },
            { name: 'Mulliner', years: [2022, 2027], produced: null },
        ],
    },

    // ═══ GERMAN PERFORMANCE ═══
    'Mercedes-AMG': {
        models: [
            { name: 'One', years: [2022, 2025], produced: 275 },
            { name: 'GT Black Series', years: [2020, 2022], produced: 1700 },
            { name: 'GT R', years: [2017, 2021], produced: null },
            { name: 'GT R Pro', years: [2019, 2021], produced: 750 },
            { name: 'GT', years: [2015, 2027], produced: null },
            { name: 'GT S', years: [2015, 2020], produced: null },
            { name: 'GT 63', years: [2019, 2027], produced: null },
            { name: 'GT 63 S', years: [2019, 2027], produced: null },
            { name: 'SL 55', years: [2022, 2027], produced: null },
            { name: 'SL 63', years: [2022, 2027], produced: null },
            { name: 'C 63 S', years: [2015, 2027], produced: null },
            { name: 'E 63 S', years: [2017, 2027], produced: null },
            { name: 'G 63', years: [2012, 2027], produced: null },
            { name: 'S 63', years: [2014, 2027], produced: null },
            { name: 'GLE 63 S', years: [2020, 2027], produced: null },
            { name: 'GLS 63', years: [2020, 2027], produced: null },
            { name: 'A 45 S', years: [2019, 2027], produced: null },
            { name: 'CLA 45 S', years: [2019, 2027], produced: null },
        ],
    },
    'BMW M': {
        models: [
            { name: 'M2', years: [2016, 2027], produced: null },
            { name: 'M3', years: [1986, 2027], produced: null },
            { name: 'M3 Competition', years: [2021, 2027], produced: null },
            { name: 'M3 CS', years: [2023, 2025], produced: null },
            { name: 'M4', years: [2014, 2027], produced: null },
            { name: 'M4 Competition', years: [2021, 2027], produced: null },
            { name: 'M4 CSL', years: [2023, 2024], produced: 1000 },
            { name: 'M4 GTS', years: [2016, 2017], produced: 700 },
            { name: 'M5', years: [1985, 2027], produced: null },
            { name: 'M5 CS', years: [2022, 2023], produced: null },
            { name: 'M8', years: [2019, 2027], produced: null },
            { name: 'M8 Competition', years: [2020, 2027], produced: null },
            { name: 'XM', years: [2023, 2027], produced: null },
            { name: 'X3 M', years: [2019, 2027], produced: null },
            { name: 'X5 M', years: [2010, 2027], produced: null },
            { name: 'X6 M', years: [2010, 2027], produced: null },
            { name: 'Z4 M40i', years: [2019, 2027], produced: null },
        ],
    },
    'Audi': {
        models: [
            { name: 'R8', years: [2006, 2024], produced: null },
            { name: 'R8 Performance', years: [2019, 2024], produced: null },
            { name: 'R8 GT', years: [2023, 2024], produced: 333 },
            { name: 'RS e-tron GT', years: [2021, 2027], produced: null },
            { name: 'e-tron GT', years: [2021, 2027], produced: null },
            { name: 'RS7', years: [2013, 2027], produced: null },
            { name: 'RS6 Avant', years: [2002, 2027], produced: null },
            { name: 'RS5', years: [2010, 2027], produced: null },
            { name: 'RS4 Avant', years: [2000, 2027], produced: null },
            { name: 'RS3', years: [2011, 2027], produced: null },
            { name: 'TT RS', years: [2009, 2023], produced: null },
            { name: 'RS Q8', years: [2020, 2027], produced: null },
            { name: 'S5', years: [2007, 2027], produced: null },
            { name: 'SQ8', years: [2019, 2027], produced: null },
            { name: 'Q8 e-tron', years: [2023, 2027], produced: null },
        ],
    },

    // ═══ JAPANESE PERFORMANCE ═══
    'Nissan': {
        models: [
            { name: 'GT-R', years: [2007, 2025], produced: null },
            { name: 'GT-R Nismo', years: [2014, 2025], produced: null },
            { name: 'GT-R T-Spec', years: [2021, 2024], produced: 100 },
            { name: '370Z', years: [2009, 2020], produced: null },
            { name: '370Z Nismo', years: [2014, 2020], produced: null },
            { name: 'Z', years: [2023, 2027], produced: null },
            { name: 'Z Nismo', years: [2024, 2027], produced: null },
            { name: 'Skyline GT-R R34', years: [1999, 2002], produced: 11344 },
            { name: 'Skyline GT-R R33', years: [1995, 1998], produced: 16668 },
            { name: 'Skyline GT-R R32', years: [1989, 1994], produced: 43937 },
            { name: '240SX', years: [1989, 1998], produced: null },
            { name: 'Silvia S15', years: [1999, 2002], produced: null },
        ],
    },
    'Toyota': {
        models: [
            { name: 'GR Supra', years: [2019, 2027], produced: null },
            { name: 'GR86', years: [2022, 2027], produced: null },
            { name: 'GR Corolla', years: [2023, 2027], produced: null },
            { name: 'GR Yaris', years: [2020, 2027], produced: null },
            { name: 'Supra A80', years: [1993, 2002], produced: null },
            { name: 'Supra A70', years: [1986, 1993], produced: null },
            { name: 'MR2', years: [1984, 2007], produced: null },
            { name: 'AE86 Corolla', years: [1983, 1987], produced: null },
            { name: '2000GT', years: [1967, 1970], produced: 351 },
            { name: 'LFA', years: [2010, 2012], produced: 500 },
            { name: 'LC 500', years: [2017, 2027], produced: null },
        ],
    },
    'Honda': {
        models: [
            { name: 'NSX', years: [1990, 2005], produced: 18000 },
            { name: 'NSX (2nd Gen)', years: [2016, 2022], produced: null },
            { name: 'NSX Type S', years: [2022, 2022], produced: 350 },
            { name: 'S2000', years: [1999, 2009], produced: null },
            { name: 'Civic Type R', years: [1997, 2027], produced: null },
            { name: 'Integra Type R', years: [1997, 2001], produced: null },
        ],
    },
    'Mazda': {
        models: [
            { name: 'RX-7', years: [1978, 2002], produced: null },
            { name: 'RX-8', years: [2003, 2012], produced: null },
            { name: 'MX-5 Miata', years: [1989, 2027], produced: null },
            { name: 'MX-5 Miata RF', years: [2017, 2027], produced: null },
        ],
    },
    'Subaru': {
        models: [
            { name: 'WRX STI', years: [2004, 2021], produced: null },
            { name: 'WRX', years: [2002, 2027], produced: null },
            { name: 'BRZ', years: [2012, 2027], produced: null },
            { name: 'BRZ tS', years: [2018, 2020], produced: null },
            { name: '22B STi', years: [1998, 1999], produced: 424 },
        ],
    },
    'Mitsubishi': {
        models: [
            { name: 'Lancer Evolution X', years: [2008, 2016], produced: null },
            { name: 'Lancer Evolution IX', years: [2005, 2007], produced: null },
            { name: 'Lancer Evolution VIII', years: [2003, 2005], produced: null },
            { name: '3000GT VR-4', years: [1991, 1999], produced: null },
            { name: 'Eclipse', years: [1989, 2012], produced: null },
        ],
    },

    // ═══ AMERICAN PERFORMANCE ═══
    'Ford': {
        models: [
            { name: 'GT', years: [2005, 2006], produced: 4038 },
            { name: 'GT (2nd Gen)', years: [2017, 2022], produced: 1350 },
            { name: 'Mustang GT', years: [1964, 2027], produced: null },
            { name: 'Mustang Shelby GT500', years: [2007, 2027], produced: null },
            { name: 'Mustang Shelby GT350', years: [2015, 2020], produced: null },
            { name: 'Mustang Mach 1', years: [2021, 2024], produced: null },
            { name: 'Mustang Dark Horse', years: [2024, 2027], produced: null },
            { name: 'Mustang Mach-E GT', years: [2021, 2027], produced: null },
            { name: 'Bronco Raptor', years: [2022, 2027], produced: null },
            { name: 'F-150 Raptor', years: [2010, 2027], produced: null },
            { name: 'F-150 Raptor R', years: [2023, 2027], produced: null },
        ],
    },
    'Chevrolet': {
        models: [
            { name: 'Corvette Stingray', years: [2014, 2027], produced: null },
            { name: 'Corvette Z06', years: [2006, 2027], produced: null },
            { name: 'Corvette ZR1', years: [2009, 2027], produced: null },
            { name: 'Corvette E-Ray', years: [2024, 2027], produced: null },
            { name: 'Corvette Grand Sport', years: [2017, 2019], produced: null },
            { name: 'Corvette C7', years: [2014, 2019], produced: null },
            { name: 'Corvette C6', years: [2005, 2013], produced: null },
            { name: 'Camaro ZL1', years: [2012, 2024], produced: null },
            { name: 'Camaro SS', years: [1967, 2024], produced: null },
            { name: 'Camaro Z/28', years: [2014, 2015], produced: null },
        ],
    },
    'Dodge': {
        models: [
            { name: 'Viper', years: [1991, 2017], produced: null },
            { name: 'Viper ACR', years: [1999, 2017], produced: null },
            { name: 'Challenger SRT Hellcat', years: [2015, 2023], produced: null },
            { name: 'Challenger SRT Demon', years: [2018, 2018], produced: 3300 },
            { name: 'Challenger SRT Demon 170', years: [2023, 2023], produced: 3300 },
            { name: 'Charger SRT Hellcat', years: [2015, 2023], produced: null },
            { name: 'Charger Daytona EV', years: [2024, 2027], produced: null },
        ],
    },

    // ═══ ELECTRIC ═══
    'Tesla': {
        models: [
            { name: 'Model S Plaid', years: [2021, 2027], produced: null },
            { name: 'Model S', years: [2012, 2027], produced: null },
            { name: 'Model 3', years: [2017, 2027], produced: null },
            { name: 'Model 3 Performance', years: [2018, 2027], produced: null },
            { name: 'Model X', years: [2015, 2027], produced: null },
            { name: 'Model X Plaid', years: [2021, 2027], produced: null },
            { name: 'Model Y', years: [2020, 2027], produced: null },
            { name: 'Model Y Performance', years: [2020, 2027], produced: null },
            { name: 'Cybertruck', years: [2024, 2027], produced: null },
            { name: 'Roadster (Original)', years: [2008, 2012], produced: 2450 },
            { name: 'Roadster (2nd Gen)', years: [2025, 2027], produced: null },
        ],
    },
    'Rivian': {
        models: [
            { name: 'R1T', years: [2022, 2027], produced: null },
            { name: 'R1S', years: [2022, 2027], produced: null },
            { name: 'R2', years: [2026, 2027], produced: null },
        ],
    },
    'Lucid': {
        models: [
            { name: 'Air', years: [2022, 2027], produced: null },
            { name: 'Air Grand Touring', years: [2022, 2027], produced: null },
            { name: 'Air Sapphire', years: [2023, 2027], produced: null },
            { name: 'Gravity', years: [2025, 2027], produced: null },
        ],
    },
    'Polestar': {
        models: [
            { name: '1', years: [2019, 2021], produced: 1500 },
            { name: '2', years: [2020, 2027], produced: null },
            { name: '3', years: [2024, 2027], produced: null },
            { name: '4', years: [2024, 2027], produced: null },
        ],
    },

    // ═══ OTHER EXOTICS ═══
    'De Tomaso': {
        models: [
            { name: 'P72', years: [2024, 2026], produced: 72 },
            { name: 'Pantera', years: [1971, 1993], produced: 7260 },
            { name: 'Mangusta', years: [1967, 1971], produced: 401 },
        ],
    },
    'Jaguar': {
        models: [
            { name: 'F-Type R', years: [2014, 2024], produced: null },
            { name: 'F-Type SVR', years: [2016, 2020], produced: null },
            { name: 'F-Type P450', years: [2021, 2024], produced: null },
            { name: 'XE SV Project 8', years: [2017, 2019], produced: 300 },
            { name: 'E-Type', years: [1961, 1975], produced: 72507 },
            { name: 'XJ220', years: [1992, 1994], produced: 282 },
            { name: 'C-X75', years: [2013, 2015], produced: 5 },
        ],
    },
    'Genesis': {
        models: [
            { name: 'G70', years: [2018, 2027], produced: null },
            { name: 'G80', years: [2017, 2027], produced: null },
            { name: 'G90', years: [2017, 2027], produced: null },
            { name: 'GV70', years: [2021, 2027], produced: null },
            { name: 'GV80', years: [2020, 2027], produced: null },
        ],
    },
    'Alpine': {
        models: [
            { name: 'A110', years: [2017, 2027], produced: null },
            { name: 'A110 S', years: [2019, 2027], produced: null },
            { name: 'A110 R', years: [2023, 2027], produced: null },
            { name: 'A290', years: [2025, 2027], produced: null },
        ],
    },
    'Shelby': {
        models: [
            { name: 'Cobra 427', years: [1965, 1967], produced: 348 },
            { name: 'Daytona Coupe', years: [1964, 1965], produced: 6 },
            { name: 'GT350', years: [1965, 1970], produced: null },
            { name: 'GT500', years: [1967, 1970], produced: null },
            { name: 'Super Snake', years: [2017, 2023], produced: null },
        ],
    },

    // ═══════════════════════════════════════
    // MAINSTREAM / POPULAR BRANDS
    // ═══════════════════════════════════════

    'Toyota': {
        models: [
            { name: 'Camry', years: [1983, 2027], produced: null },
            { name: 'Corolla', years: [1966, 2027], produced: null },
            { name: 'RAV4', years: [1996, 2027], produced: null },
            { name: 'Highlander', years: [2001, 2027], produced: null },
            { name: '4Runner', years: [1984, 2027], produced: null },
            { name: 'Tacoma', years: [1995, 2027], produced: null },
            { name: 'Tundra', years: [2000, 2027], produced: null },
            { name: 'GR Supra', years: [2019, 2027], produced: null },
            { name: 'GR86', years: [2022, 2027], produced: null },
            { name: 'GR Corolla', years: [2023, 2027], produced: null },
            { name: 'Prius', years: [1997, 2027], produced: null },
            { name: 'bZ4X', years: [2023, 2027], produced: null },
            { name: 'Crown', years: [2023, 2027], produced: null },
            { name: 'Sequoia', years: [2001, 2027], produced: null },
            { name: 'Land Cruiser', years: [1984, 2027], produced: null },
            { name: 'Sienna', years: [1998, 2027], produced: null },
            { name: 'Venza', years: [2009, 2027], produced: null },
            { name: 'Corolla Cross', years: [2022, 2027], produced: null },
            { name: 'C-HR', years: [2018, 2027], produced: null },
            { name: '2000GT', years: [1967, 1970], produced: 351 },
            { name: 'LFA', years: [2010, 2012], produced: 500 },
            { name: 'MR2', years: [1984, 2007], produced: null },
            { name: 'Celica', years: [1970, 2006], produced: null },
        ],
    },
    'Honda': {
        models: [
            { name: 'Civic', years: [1973, 2027], produced: null },
            { name: 'Civic Si', years: [1986, 2027], produced: null },
            { name: 'Civic Type R', years: [1997, 2027], produced: null },
            { name: 'Accord', years: [1976, 2027], produced: null },
            { name: 'CR-V', years: [1997, 2027], produced: null },
            { name: 'HR-V', years: [2016, 2027], produced: null },
            { name: 'Pilot', years: [2003, 2027], produced: null },
            { name: 'Passport', years: [2019, 2027], produced: null },
            { name: 'Ridgeline', years: [2006, 2027], produced: null },
            { name: 'Odyssey', years: [1995, 2027], produced: null },
            { name: 'Fit', years: [2007, 2020], produced: null },
            { name: 'S2000', years: [1999, 2009], produced: null },
            { name: 'NSX', years: [1990, 2005], produced: 18000 },
            { name: 'NSX (2nd Gen)', years: [2017, 2022], produced: 2781 },
            { name: 'NSX Type S', years: [2022, 2022], produced: 350 },
            { name: 'Integra', years: [2023, 2027], produced: null },
            { name: 'Prelude', years: [1979, 2001], produced: null },
            { name: 'Prologue', years: [2024, 2027], produced: null },
        ],
    },
    'Ford': {
        models: [
            { name: 'Mustang', years: [1964, 2027], produced: null },
            { name: 'Mustang GT', years: [1982, 2027], produced: null },
            { name: 'Mustang Shelby GT350', years: [2016, 2020], produced: null },
            { name: 'Mustang Shelby GT500', years: [2020, 2023], produced: null },
            { name: 'Mustang Dark Horse', years: [2024, 2027], produced: null },
            { name: 'Mustang Mach-E', years: [2021, 2027], produced: null },
            { name: 'F-150', years: [1975, 2027], produced: null },
            { name: 'F-150 Raptor', years: [2010, 2027], produced: null },
            { name: 'F-150 Raptor R', years: [2023, 2027], produced: null },
            { name: 'F-150 Lightning', years: [2022, 2027], produced: null },
            { name: 'Bronco', years: [2021, 2027], produced: null },
            { name: 'Bronco Raptor', years: [2022, 2027], produced: null },
            { name: 'Explorer', years: [1991, 2027], produced: null },
            { name: 'Expedition', years: [1997, 2027], produced: null },
            { name: 'Escape', years: [2001, 2027], produced: null },
            { name: 'Edge', years: [2007, 2024], produced: null },
            { name: 'Ranger', years: [1993, 2027], produced: null },
            { name: 'Maverick', years: [2022, 2027], produced: null },
            { name: 'GT', years: [2005, 2006], produced: 4038 },
            { name: 'GT (2nd Gen)', years: [2017, 2022], produced: 1350 },
            { name: 'Focus RS', years: [2016, 2018], produced: null },
            { name: 'Fiesta ST', years: [2014, 2019], produced: null },
        ],
    },
    'Chevrolet': {
        models: [
            { name: 'Corvette', years: [1953, 2027], produced: null },
            { name: 'Corvette Z06', years: [2023, 2027], produced: null },
            { name: 'Corvette ZR1', years: [2025, 2027], produced: null },
            { name: 'Corvette E-Ray', years: [2024, 2027], produced: null },
            { name: 'Corvette C6 ZR1', years: [2009, 2013], produced: 4684 },
            { name: 'Camaro', years: [1967, 2024], produced: null },
            { name: 'Camaro ZL1', years: [2017, 2024], produced: null },
            { name: 'Camaro SS', years: [1967, 2024], produced: null },
            { name: 'Silverado', years: [1999, 2027], produced: null },
            { name: 'Silverado EV', years: [2024, 2027], produced: null },
            { name: 'Tahoe', years: [1995, 2027], produced: null },
            { name: 'Suburban', years: [1935, 2027], produced: null },
            { name: 'Equinox', years: [2005, 2027], produced: null },
            { name: 'Equinox EV', years: [2024, 2027], produced: null },
            { name: 'Blazer', years: [2019, 2027], produced: null },
            { name: 'Blazer EV', years: [2024, 2027], produced: null },
            { name: 'Traverse', years: [2009, 2027], produced: null },
            { name: 'Trax', years: [2015, 2027], produced: null },
            { name: 'Colorado', years: [2004, 2027], produced: null },
            { name: 'Colorado ZR2', years: [2017, 2027], produced: null },
            { name: 'Malibu', years: [1964, 2024], produced: null },
            { name: 'Bolt EV', years: [2017, 2023], produced: null },
        ],
    },
    'BMW': {
        models: [
            { name: '3 Series', years: [1975, 2027], produced: null },
            { name: '330i', years: [2001, 2027], produced: null },
            { name: 'M340i', years: [2020, 2027], produced: null },
            { name: '4 Series', years: [2014, 2027], produced: null },
            { name: '5 Series', years: [1972, 2027], produced: null },
            { name: '540i', years: [2017, 2027], produced: null },
            { name: 'M550i', years: [2018, 2027], produced: null },
            { name: '7 Series', years: [1977, 2027], produced: null },
            { name: '8 Series', years: [2019, 2027], produced: null },
            { name: 'X3', years: [2004, 2027], produced: null },
            { name: 'X5', years: [2000, 2027], produced: null },
            { name: 'X5 M', years: [2010, 2027], produced: null },
            { name: 'X6', years: [2008, 2027], produced: null },
            { name: 'X6 M', years: [2010, 2027], produced: null },
            { name: 'X7', years: [2019, 2027], produced: null },
            { name: 'XM', years: [2023, 2027], produced: null },
            { name: 'Z4', years: [2003, 2027], produced: null },
            { name: 'Z4 M40i', years: [2019, 2027], produced: null },
            { name: 'iX', years: [2022, 2027], produced: null },
            { name: 'i4', years: [2022, 2027], produced: null },
            { name: 'i7', years: [2023, 2027], produced: null },
            { name: '2 Series', years: [2014, 2027], produced: null },
            { name: 'M2', years: [2016, 2027], produced: null },
            { name: 'M240i', years: [2022, 2027], produced: null },
            { name: 'i8', years: [2014, 2020], produced: null },
        ],
    },
    'Mercedes-Benz': {
        models: [
            { name: 'C-Class', years: [1994, 2027], produced: null },
            { name: 'C43 AMG', years: [2017, 2027], produced: null },
            { name: 'C63 AMG', years: [2008, 2027], produced: null },
            { name: 'E-Class', years: [1994, 2027], produced: null },
            { name: 'E53 AMG', years: [2019, 2027], produced: null },
            { name: 'E63 AMG', years: [2007, 2027], produced: null },
            { name: 'S-Class', years: [1972, 2027], produced: null },
            { name: 'S580', years: [2021, 2027], produced: null },
            { name: 'Maybach S680', years: [2021, 2027], produced: null },
            { name: 'GLC', years: [2016, 2027], produced: null },
            { name: 'GLE', years: [2016, 2027], produced: null },
            { name: 'GLE AMG 63', years: [2016, 2027], produced: null },
            { name: 'GLS', years: [2017, 2027], produced: null },
            { name: 'GLS Maybach 600', years: [2021, 2027], produced: null },
            { name: 'G-Wagon G550', years: [1990, 2027], produced: null },
            { name: 'G-Wagon G63 AMG', years: [2012, 2027], produced: null },
            { name: 'CLA', years: [2014, 2027], produced: null },
            { name: 'CLE', years: [2024, 2027], produced: null },
            { name: 'SL', years: [1954, 2027], produced: null },
            { name: 'AMG GT', years: [2015, 2027], produced: null },
            { name: 'AMG GT 63', years: [2019, 2027], produced: null },
            { name: 'EQS', years: [2022, 2027], produced: null },
            { name: 'EQE', years: [2023, 2027], produced: null },
            { name: 'EQB', years: [2022, 2027], produced: null },
            { name: 'A-Class', years: [2019, 2023], produced: null },
            { name: 'AMG One', years: [2022, 2025], produced: 275 },
        ],
    },
    'Audi': {
        models: [
            { name: 'A3', years: [1996, 2027], produced: null },
            { name: 'A4', years: [1994, 2027], produced: null },
            { name: 'S4', years: [1992, 2027], produced: null },
            { name: 'A5', years: [2007, 2027], produced: null },
            { name: 'S5', years: [2008, 2027], produced: null },
            { name: 'A6', years: [1994, 2027], produced: null },
            { name: 'S6', years: [1995, 2027], produced: null },
            { name: 'A7', years: [2012, 2027], produced: null },
            { name: 'A8', years: [1994, 2027], produced: null },
            { name: 'Q3', years: [2015, 2027], produced: null },
            { name: 'Q5', years: [2009, 2027], produced: null },
            { name: 'SQ5', years: [2013, 2027], produced: null },
            { name: 'Q7', years: [2007, 2027], produced: null },
            { name: 'SQ7', years: [2017, 2027], produced: null },
            { name: 'Q8', years: [2019, 2027], produced: null },
            { name: 'SQ8', years: [2020, 2027], produced: null },
            { name: 'RS3', years: [2011, 2027], produced: null },
            { name: 'RS4', years: [2000, 2027], produced: null },
            { name: 'RS5', years: [2010, 2027], produced: null },
            { name: 'RS6 Avant', years: [2002, 2027], produced: null },
            { name: 'RS7', years: [2014, 2027], produced: null },
            { name: 'R8 V10', years: [2007, 2023], produced: null },
            { name: 'R8 V10 Performance', years: [2019, 2023], produced: null },
            { name: 'R8 GT', years: [2011, 2012], produced: 333 },
            { name: 'TT RS', years: [2010, 2023], produced: null },
            { name: 'e-tron GT', years: [2022, 2027], produced: null },
            { name: 'RS e-tron GT', years: [2022, 2027], produced: null },
            { name: 'Q4 e-tron', years: [2022, 2027], produced: null },
        ],
    },
    'Nissan': {
        models: [
            { name: 'Altima', years: [1993, 2027], produced: null },
            { name: 'Maxima', years: [1981, 2023], produced: null },
            { name: 'Sentra', years: [1982, 2027], produced: null },
            { name: 'Versa', years: [2007, 2027], produced: null },
            { name: 'Rogue', years: [2008, 2027], produced: null },
            { name: 'Pathfinder', years: [1986, 2027], produced: null },
            { name: 'Armada', years: [2004, 2027], produced: null },
            { name: 'Murano', years: [2003, 2027], produced: null },
            { name: 'Kicks', years: [2018, 2027], produced: null },
            { name: 'Frontier', years: [1998, 2027], produced: null },
            { name: 'Titan', years: [2004, 2027], produced: null },
            { name: '370Z', years: [2009, 2020], produced: null },
            { name: 'Z', years: [2023, 2027], produced: null },
            { name: 'Z Nismo', years: [2024, 2027], produced: null },
            { name: 'GT-R', years: [2009, 2024], produced: null },
            { name: 'GT-R Nismo', years: [2015, 2024], produced: null },
            { name: 'GT-R T-spec', years: [2021, 2024], produced: null },
            { name: 'R34 Skyline GT-R', years: [1999, 2002], produced: 11578 },
            { name: 'R33 Skyline GT-R', years: [1995, 1998], produced: null },
            { name: 'R32 Skyline GT-R', years: [1989, 1994], produced: null },
            { name: 'Leaf', years: [2011, 2024], produced: null },
            { name: 'Ariya', years: [2023, 2027], produced: null },
            { name: '240SX', years: [1989, 1998], produced: null },
            { name: '300ZX', years: [1984, 1996], produced: null },
        ],
    },
    'Mazda': {
        models: [
            { name: 'Mazda3', years: [2004, 2027], produced: null },
            { name: 'Mazda3 Turbo', years: [2021, 2027], produced: null },
            { name: 'CX-5', years: [2013, 2027], produced: null },
            { name: 'CX-30', years: [2020, 2027], produced: null },
            { name: 'CX-50', years: [2023, 2027], produced: null },
            { name: 'CX-70', years: [2025, 2027], produced: null },
            { name: 'CX-90', years: [2024, 2027], produced: null },
            { name: 'MX-5 Miata', years: [1990, 2027], produced: null },
            { name: 'MX-5 Miata RF', years: [2017, 2027], produced: null },
            { name: 'RX-7', years: [1978, 2002], produced: null },
            { name: 'RX-7 Spirit R', years: [2002, 2002], produced: 1500 },
            { name: 'RX-8', years: [2004, 2012], produced: null },
            { name: 'Mazda6', years: [2003, 2021], produced: null },
        ],
    },
    'Subaru': {
        models: [
            { name: 'WRX', years: [2002, 2027], produced: null },
            { name: 'WRX STI', years: [2004, 2021], produced: null },
            { name: 'BRZ', years: [2013, 2027], produced: null },
            { name: 'Outback', years: [1995, 2027], produced: null },
            { name: 'Forester', years: [1998, 2027], produced: null },
            { name: 'Crosstrek', years: [2013, 2027], produced: null },
            { name: 'Impreza', years: [1993, 2027], produced: null },
            { name: 'Legacy', years: [1990, 2027], produced: null },
            { name: 'Ascent', years: [2019, 2027], produced: null },
            { name: 'Solterra', years: [2023, 2027], produced: null },
            { name: '22B STi', years: [1998, 1998], produced: 424 },
        ],
    },
    'Volkswagen': {
        models: [
            { name: 'Golf', years: [1974, 2027], produced: null },
            { name: 'Golf GTI', years: [1976, 2027], produced: null },
            { name: 'Golf R', years: [2012, 2027], produced: null },
            { name: 'Jetta', years: [1979, 2027], produced: null },
            { name: 'Jetta GLI', years: [1984, 2027], produced: null },
            { name: 'Tiguan', years: [2009, 2027], produced: null },
            { name: 'Atlas', years: [2018, 2027], produced: null },
            { name: 'Taos', years: [2022, 2027], produced: null },
            { name: 'ID.4', years: [2021, 2027], produced: null },
            { name: 'ID.Buzz', years: [2024, 2027], produced: null },
            { name: 'Arteon', years: [2019, 2024], produced: null },
            { name: 'Passat', years: [1973, 2022], produced: null },
        ],
    },
    'Hyundai': {
        models: [
            { name: 'Elantra', years: [1991, 2027], produced: null },
            { name: 'Elantra N', years: [2022, 2027], produced: null },
            { name: 'Sonata', years: [1988, 2027], produced: null },
            { name: 'Sonata N Line', years: [2021, 2027], produced: null },
            { name: 'Tucson', years: [2005, 2027], produced: null },
            { name: 'Santa Fe', years: [2001, 2027], produced: null },
            { name: 'Palisade', years: [2020, 2027], produced: null },
            { name: 'Kona', years: [2018, 2027], produced: null },
            { name: 'Kona N', years: [2022, 2025], produced: null },
            { name: 'Ioniq 5', years: [2022, 2027], produced: null },
            { name: 'Ioniq 5 N', years: [2024, 2027], produced: null },
            { name: 'Ioniq 6', years: [2023, 2027], produced: null },
            { name: 'Veloster N', years: [2019, 2023], produced: null },
            { name: 'Santa Cruz', years: [2022, 2027], produced: null },
        ],
    },
    'Kia': {
        models: [
            { name: 'Forte', years: [2010, 2027], produced: null },
            { name: 'K5', years: [2021, 2027], produced: null },
            { name: 'Stinger', years: [2018, 2023], produced: null },
            { name: 'Stinger GT', years: [2018, 2023], produced: null },
            { name: 'Sportage', years: [1995, 2027], produced: null },
            { name: 'Sorento', years: [2002, 2027], produced: null },
            { name: 'Telluride', years: [2020, 2027], produced: null },
            { name: 'Seltos', years: [2020, 2027], produced: null },
            { name: 'Soul', years: [2010, 2027], produced: null },
            { name: 'EV6', years: [2022, 2027], produced: null },
            { name: 'EV6 GT', years: [2023, 2027], produced: null },
            { name: 'EV9', years: [2024, 2027], produced: null },
            { name: 'Carnival', years: [2022, 2027], produced: null },
        ],
    },
    'Lexus': {
        models: [
            { name: 'IS 350', years: [2006, 2027], produced: null },
            { name: 'IS 500', years: [2022, 2027], produced: null },
            { name: 'ES 350', years: [2007, 2027], produced: null },
            { name: 'GS F', years: [2016, 2020], produced: null },
            { name: 'LS 500', years: [2018, 2027], produced: null },
            { name: 'RC F', years: [2015, 2027], produced: null },
            { name: 'RC F Track Edition', years: [2020, 2022], produced: null },
            { name: 'LC 500', years: [2018, 2027], produced: null },
            { name: 'LC 500h', years: [2018, 2027], produced: null },
            { name: 'LFA', years: [2010, 2012], produced: 500 },
            { name: 'LFA Nürburgring Edition', years: [2012, 2012], produced: 50 },
            { name: 'NX', years: [2015, 2027], produced: null },
            { name: 'RX 350', years: [2004, 2027], produced: null },
            { name: 'RX 500h', years: [2023, 2027], produced: null },
            { name: 'GX', years: [2003, 2027], produced: null },
            { name: 'LX 600', years: [2022, 2027], produced: null },
            { name: 'TX', years: [2024, 2027], produced: null },
            { name: 'UX', years: [2019, 2027], produced: null },
            { name: 'RZ 450e', years: [2023, 2027], produced: null },
        ],
    },
    'Acura': {
        models: [
            { name: 'Integra', years: [2023, 2027], produced: null },
            { name: 'Integra Type S', years: [2024, 2027], produced: null },
            { name: 'TLX', years: [2015, 2027], produced: null },
            { name: 'TLX Type S', years: [2021, 2027], produced: null },
            { name: 'MDX', years: [2001, 2027], produced: null },
            { name: 'MDX Type S', years: [2022, 2027], produced: null },
            { name: 'RDX', years: [2007, 2027], produced: null },
            { name: 'ZDX', years: [2024, 2027], produced: null },
            { name: 'NSX Type S', years: [2022, 2022], produced: 350 },
        ],
    },
    'Infiniti': {
        models: [
            { name: 'Q50', years: [2014, 2027], produced: null },
            { name: 'Q50 Red Sport 400', years: [2016, 2027], produced: null },
            { name: 'Q60 Red Sport', years: [2017, 2023], produced: null },
            { name: 'QX50', years: [2019, 2027], produced: null },
            { name: 'QX55', years: [2022, 2027], produced: null },
            { name: 'QX60', years: [2013, 2027], produced: null },
            { name: 'QX80', years: [2011, 2027], produced: null },
        ],
    },
    'Volvo': {
        models: [
            { name: 'S60', years: [2001, 2027], produced: null },
            { name: 'S90', years: [2017, 2027], produced: null },
            { name: 'V60', years: [2018, 2027], produced: null },
            { name: 'V60 Polestar', years: [2014, 2018], produced: null },
            { name: 'XC40', years: [2019, 2027], produced: null },
            { name: 'XC60', years: [2009, 2027], produced: null },
            { name: 'XC90', years: [2003, 2027], produced: null },
            { name: 'C40 Recharge', years: [2022, 2027], produced: null },
            { name: 'EX30', years: [2024, 2027], produced: null },
            { name: 'EX90', years: [2024, 2027], produced: null },
        ],
    },
    'Cadillac': {
        models: [
            { name: 'CT4', years: [2020, 2027], produced: null },
            { name: 'CT4-V Blackwing', years: [2022, 2027], produced: null },
            { name: 'CT5', years: [2020, 2027], produced: null },
            { name: 'CT5-V Blackwing', years: [2022, 2027], produced: null },
            { name: 'Escalade', years: [1999, 2027], produced: null },
            { name: 'Escalade V', years: [2023, 2027], produced: null },
            { name: 'XT4', years: [2019, 2027], produced: null },
            { name: 'XT5', years: [2017, 2027], produced: null },
            { name: 'XT6', years: [2020, 2027], produced: null },
            { name: 'Lyriq', years: [2023, 2027], produced: null },
            { name: 'Celestiq', years: [2024, 2027], produced: null },
            { name: 'CTS-V', years: [2004, 2019], produced: null },
        ],
    },
    'Lincoln': {
        models: [
            { name: 'Corsair', years: [2020, 2027], produced: null },
            { name: 'Nautilus', years: [2019, 2027], produced: null },
            { name: 'Aviator', years: [2020, 2027], produced: null },
            { name: 'Navigator', years: [1998, 2027], produced: null },
        ],
    },
    'Jeep': {
        models: [
            { name: 'Wrangler', years: [1987, 2027], produced: null },
            { name: 'Wrangler Rubicon 392', years: [2021, 2024], produced: null },
            { name: 'Grand Cherokee', years: [1993, 2027], produced: null },
            { name: 'Grand Cherokee Trackhawk', years: [2018, 2021], produced: null },
            { name: 'Gladiator', years: [2020, 2027], produced: null },
            { name: 'Grand Wagoneer', years: [2022, 2027], produced: null },
            { name: 'Cherokee', years: [2014, 2023], produced: null },
            { name: 'Compass', years: [2017, 2027], produced: null },
        ],
    },
    'Ram': {
        models: [
            { name: '1500', years: [2009, 2027], produced: null },
            { name: '1500 TRX', years: [2021, 2024], produced: null },
            { name: '1500 REV', years: [2025, 2027], produced: null },
            { name: '2500', years: [2010, 2027], produced: null },
            { name: '3500', years: [2010, 2027], produced: null },
        ],
    },
    'GMC': {
        models: [
            { name: 'Sierra 1500', years: [1999, 2027], produced: null },
            { name: 'Sierra Denali', years: [2002, 2027], produced: null },
            { name: 'Sierra EV Denali', years: [2024, 2027], produced: null },
            { name: 'Yukon', years: [1992, 2027], produced: null },
            { name: 'Yukon Denali', years: [1999, 2027], produced: null },
            { name: 'Canyon AT4X', years: [2023, 2027], produced: null },
            { name: 'Terrain', years: [2010, 2027], produced: null },
            { name: 'Acadia', years: [2007, 2027], produced: null },
            { name: 'Hummer EV', years: [2022, 2027], produced: null },
            { name: 'Hummer EV SUV', years: [2024, 2027], produced: null },
        ],
    },
    'Dodge': {
        models: [
            { name: 'Challenger', years: [2008, 2023], produced: null },
            { name: 'Challenger SRT Hellcat', years: [2015, 2023], produced: null },
            { name: 'Challenger SRT Demon', years: [2018, 2018], produced: 3300 },
            { name: 'Challenger SRT Demon 170', years: [2023, 2023], produced: null },
            { name: 'Charger', years: [2006, 2023], produced: null },
            { name: 'Charger SRT Hellcat', years: [2015, 2023], produced: null },
            { name: 'Charger Daytona EV', years: [2024, 2027], produced: null },
            { name: 'Durango', years: [2011, 2027], produced: null },
            { name: 'Durango SRT Hellcat', years: [2021, 2022], produced: null },
            { name: 'Viper', years: [1992, 2017], produced: null },
            { name: 'Viper ACR', years: [2016, 2017], produced: null },
            { name: 'Viper GTS', years: [1996, 2017], produced: null },
        ],
    },
    'Tesla': {
        models: [
            { name: 'Model S', years: [2012, 2027], produced: null },
            { name: 'Model S Plaid', years: [2021, 2027], produced: null },
            { name: 'Model 3', years: [2017, 2027], produced: null },
            { name: 'Model 3 Performance', years: [2018, 2027], produced: null },
            { name: 'Model X', years: [2016, 2027], produced: null },
            { name: 'Model X Plaid', years: [2022, 2027], produced: null },
            { name: 'Model Y', years: [2020, 2027], produced: null },
            { name: 'Model Y Performance', years: [2020, 2027], produced: null },
            { name: 'Cybertruck', years: [2024, 2027], produced: null },
            { name: 'Cybertruck Cyberbeast', years: [2024, 2027], produced: null },
            { name: 'Roadster (2nd Gen)', years: [2025, 2027], produced: null },
            { name: 'Roadster (1st Gen)', years: [2008, 2012], produced: 2450 },
            { name: 'Semi', years: [2023, 2027], produced: null },
        ],
    },
    'Rivian': {
        models: [
            { name: 'R1T', years: [2022, 2027], produced: null },
            { name: 'R1S', years: [2022, 2027], produced: null },
            { name: 'R2', years: [2026, 2027], produced: null },
            { name: 'R3', years: [2027, 2027], produced: null },
        ],
    },
    'Lucid': {
        models: [
            { name: 'Air', years: [2022, 2027], produced: null },
            { name: 'Air Grand Touring', years: [2022, 2027], produced: null },
            { name: 'Air Sapphire', years: [2023, 2027], produced: null },
            { name: 'Gravity', years: [2025, 2027], produced: null },
        ],
    },
    'Polestar': {
        models: [
            { name: '1', years: [2020, 2021], produced: 1500 },
            { name: '2', years: [2020, 2027], produced: null },
            { name: '3', years: [2024, 2027], produced: null },
            { name: '4', years: [2024, 2027], produced: null },
        ],
    },
    'Chrysler': {
        models: [
            { name: 'Pacifica', years: [2017, 2027], produced: null },
            { name: '300', years: [2005, 2023], produced: null },
            { name: '300 SRT8', years: [2006, 2014], produced: null },
        ],
    },
    'Buick': {
        models: [
            { name: 'Enclave', years: [2008, 2027], produced: null },
            { name: 'Encore GX', years: [2020, 2027], produced: null },
            { name: 'Envista', years: [2024, 2027], produced: null },
            { name: 'Grand National GNX', years: [1987, 1987], produced: 547 },
        ],
    },
    'Mini': {
        models: [
            { name: 'Cooper', years: [2002, 2027], produced: null },
            { name: 'Cooper S', years: [2002, 2027], produced: null },
            { name: 'John Cooper Works', years: [2008, 2027], produced: null },
            { name: 'Countryman', years: [2011, 2027], produced: null },
            { name: 'Clubman', years: [2008, 2023], produced: null },
        ],
    },
    'Mitsubishi': {
        models: [
            { name: 'Outlander', years: [2003, 2027], produced: null },
            { name: 'Eclipse Cross', years: [2018, 2027], produced: null },
            { name: 'Lancer Evolution X', years: [2008, 2016], produced: null },
            { name: 'Lancer Evolution IX', years: [2005, 2007], produced: null },
            { name: 'Lancer Evolution VIII', years: [2003, 2005], produced: null },
            { name: '3000GT VR-4', years: [1991, 1999], produced: null },
            { name: 'Eclipse', years: [1990, 2012], produced: null },
        ],
    },
    'Land Rover': {
        models: [
            { name: 'Range Rover', years: [1970, 2027], produced: null },
            { name: 'Range Rover Sport', years: [2005, 2027], produced: null },
            { name: 'Range Rover Sport SVR', years: [2015, 2022], produced: null },
            { name: 'Range Rover Velar', years: [2018, 2027], produced: null },
            { name: 'Range Rover Evoque', years: [2012, 2027], produced: null },
            { name: 'Defender 90', years: [2020, 2027], produced: null },
            { name: 'Defender 110', years: [2020, 2027], produced: null },
            { name: 'Defender V8', years: [2022, 2027], produced: null },
            { name: 'Discovery', years: [1994, 2027], produced: null },
        ],
    },
    'Fiat': {
        models: [
            { name: '500', years: [2012, 2027], produced: null },
            { name: '500 Abarth', years: [2012, 2019], produced: null },
            { name: '124 Spider Abarth', years: [2017, 2020], produced: null },
        ],
    },
};

// ──── Cache ────
const cache = {
    allMakes: null,
    modelsByMakeYear: {},
};

/**
 * Get all makes sorted alphabetically.
 */
export function getMakes() {
    if (cache.allMakes) return cache.allMakes;
    const makes = Object.keys(EXOTIC_DATABASE).sort((a, b) => a.localeCompare(b));
    cache.allMakes = makes;
    return makes;
}

/**
 * Get models for a given make and year.
 * Filters to only those produced in the given year.
 */
export function getModels(make, year) {
    const y = parseInt(year);
    if (!make || !y) return [];

    const cacheKey = `${make}_${y}`;
    if (cache.modelsByMakeYear[cacheKey]) return cache.modelsByMakeYear[cacheKey];

    const makeData = EXOTIC_DATABASE[make];
    if (!makeData) return [];

    const models = makeData.models
        .filter(m => y >= m.years[0] && y <= m.years[1])
        .map(m => m.name)
        .sort((a, b) => a.localeCompare(b));

    cache.modelsByMakeYear[cacheKey] = models;
    return models;
}

// ── Category auto-detection based on make ──
function inferCategory(make) {
    const cats = {
        'Bugatti': 'Hypercar', 'Pagani': 'Hypercar', 'Koenigsegg': 'Hypercar',
        'Rimac': 'Hypercar', 'SSC': 'Hypercar', 'Hennessey': 'Hypercar',
        'Ferrari': 'Supercar', 'Lamborghini': 'Supercar', 'McLaren': 'Supercar',
        'Aston Martin': 'Supercar', 'Porsche': 'Sports Car', 'Mercedes-AMG': 'Sports Car',
        'BMW M': 'Sports Car', 'Rolls-Royce': 'Luxury', 'Bentley': 'Luxury',
        'Lotus': 'Sports Car', 'Maserati': 'Sports Car', 'Alfa Romeo': 'Sports Car',
        'De Tomaso': 'Supercar', 'Shelby': 'Muscle Car', 'Audi': 'Sports Car',
        'Jaguar': 'Sports Car', 'Genesis': 'Luxury', 'Alpine': 'Sports Car',
        'Polestar': 'Electric', 'Lucid': 'Electric', 'Tesla': 'Electric',
        'Rivian': 'Electric', 'Dodge': 'Muscle Car', 'Chevrolet': 'Sports Car',
        'Ford': 'Sports Car', 'Nissan': 'Sports Car', 'Toyota': 'Car',
        'Honda': 'Car', 'Subaru': 'Car', 'Mazda': 'Car',
        'Mitsubishi': 'Car', 'BMW': 'Car', 'Mercedes-Benz': 'Luxury',
        'Lexus': 'Luxury', 'Acura': 'Car', 'Infiniti': 'Car',
        'Volvo': 'Car', 'Land Rover': 'SUV', 'Cadillac': 'Luxury',
        'Lincoln': 'Luxury', 'Jeep': 'SUV', 'Ram': 'Truck',
        'GMC': 'Truck', 'Chrysler': 'Car', 'Buick': 'Car',
        'Mini': 'Car', 'Fiat': 'Car', 'Hyundai': 'Car',
        'Kia': 'Car', 'Volkswagen': 'Car',
    };
    return cats[make] || 'Car';
}

/**
 * Get an image URL for a specific car make/model.
 * Uses the Imagin Studio car image API which renders actual 3D models
 * of real vehicles by make and model name.
 */
export function getCarImage(make, model) {
    // Clean up make name for the API
    const makeMap = {
        'Mercedes-AMG': 'Mercedes-Benz',
        'BMW M': 'BMW',
        'Mercedes-Benz': 'Mercedes-Benz',
    };
    const apiMake = encodeURIComponent(makeMap[make] || make);

    // The model family is typically the first word/number of the model
    // e.g. "911 GT3 RS" → "911", "Camry" → "Camry", "Model S" → "Model S"
    const apiModel = encodeURIComponent(model || '');

    // Deterministic paint color based on model name for variety
    const paints = ['pspc0001', 'pspc0002', 'pspc0003', 'pspc0012', 'pspc0014',
        'pspc0019', 'pspc0025', 'pspc0032', 'pspc0065', 'pspc0070'];
    let hash = 0;
    for (const ch of (model || '')) hash = ((hash << 5) - hash) + ch.charCodeAt(0);
    const paint = paints[Math.abs(hash) % paints.length];

    return `https://cdn.imagin.studio/getimage?customer=hrjavascript-mastery&make=${apiMake}&modelFamily=${apiModel}&paintId=${paint}&angle=23&width=600&zoomType=fullscreen`;
}

/**
 * Get the entire curated database as a flat searchable array.
 * Each entry has: id, make, model, year, category, rarity, produced, image.
 * Cached after first call.
 */
let _fullCarList = null;
export function getAllCarsForWishlist() {
    if (_fullCarList) return _fullCarList;

    const cars = [];
    let id = 1000;

    for (const [make, data] of Object.entries(EXOTIC_DATABASE)) {
        const category = inferCategory(make);
        for (const model of data.models) {
            const representativeYear = model.years[1]; // Latest year
            const rarity = calculateRarityFromDatabase(make, model.name, category);
            cars.push({
                id: `db-${id++}`,
                make,
                model: model.name,
                year: representativeYear,
                category,
                rarity,
                produced: model.produced,
                image: getCarImage(make, model.name),
            });
        }
    }

    // Sort by rarity descending so the most exciting cars appear first
    cars.sort((a, b) => b.rarity - a.rarity);
    _fullCarList = cars;
    return cars;
}

/**
 * Search the full curated database for the wishlist.
 * Searches make, model, and category.
 */
export function searchFullDatabase(query) {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    const all = getAllCarsForWishlist();
    return all.filter(car =>
        car.make.toLowerCase().includes(q) ||
        car.model.toLowerCase().includes(q) ||
        car.category.toLowerCase().includes(q) ||
        `${car.make} ${car.model}`.toLowerCase().includes(q)
    );
}

/**
 * Get production number for a specific make/model.
 * Returns null if unknown / mass-produced.
 */
export function getProductionCount(make, model) {
    const makeData = EXOTIC_DATABASE[make];
    if (!makeData) return null;
    const match = makeData.models.find(m => m.name === model);
    return match ? match.produced : null;
}

/**
 * Calculate rarity score (1–100) based on make, model, category,
 * and production numbers from the curated database.
 *
 * Scoring breakdown:
 *   Brand Tier:        15–60 base points
 *   Category Bonus:    0–15 points
 *   Production Volume: 0–50 points  (heavily weighted — limited production rules)
 *   Clamp:             minimum 1, no maximum cap
 *
 * Target: Only ~2 cars in the world should be able to hit 100
 *   (Aston Martin Victor = 1 made, Rimac Concept S = 2 made)
 */
export function calculateRarityFromDatabase(make, model, category) {
    let score = 15; // Base: everyday common car

    const makeLower = (make || '').toLowerCase();

    // ──── Brand tier (base score) ────
    const mythicMakes = ['bugatti', 'pagani', 'koenigsegg', 'rimac', 'ssc', 'hennessey'];
    const legendaryMakes = ['ferrari', 'lamborghini', 'mclaren', 'aston martin'];
    const epicMakes = ['porsche', 'mercedes-amg', 'rolls-royce', 'bentley', 'lotus', 'maserati', 'alfa romeo', 'bmw m', 'de tomaso', 'shelby'];
    const rareMakes = ['audi', 'jaguar', 'genesis', 'alpine', 'polestar', 'lucid'];
    const uncommonMakes = ['tesla', 'rivian', 'dodge', 'chevrolet', 'ford', 'nissan', 'toyota', 'honda', 'subaru', 'mazda', 'mitsubishi'];

    if (mythicMakes.includes(makeLower)) score = 60;
    else if (legendaryMakes.includes(makeLower)) score = 50;
    else if (epicMakes.includes(makeLower)) score = 38;
    else if (rareMakes.includes(makeLower)) score = 28;
    else if (uncommonMakes.includes(makeLower)) score = 20;

    // ──── Category bonuses ────
    const cat = (category || '').toLowerCase();
    if (cat === 'hypercar') score += 15;
    else if (cat === 'supercar') score += 10;
    else if (cat === 'race car') score += 8;
    else if (cat === 'classic') score += 7;
    else if (cat === 'sports car') score += 5;
    else if (cat === 'convertible' || cat === 'coupe') score += 3;
    else if (cat === 'muscle car') score += 4;
    else if (cat === 'electric') score += 2;
    else if (cat === 'luxury') score += 3;

    // ──── Production number scoring (HEAVILY weighted) ────
    // Production is the strongest signal of real-world rarity.
    // A Ford GT with 1,350 units is genuinely rare regardless of brand.
    const produced = getProductionCount(make, model);
    if (produced !== null) {
        if (produced <= 2) score += 50;         // One-off / pair (Aston Martin Victor)
        else if (produced <= 5) score += 45;    // Handful (Lamborghini Veneno = 5)
        else if (produced <= 10) score += 40;   // Single digits (Bugatti Centodieci)
        else if (produced <= 25) score += 35;   // Ultra-exclusive (McLaren Solus GT = 25)
        else if (produced <= 50) score += 30;   // Hyper-limited (Lamborghini Centenario = 40)
        else if (produced <= 100) score += 26;  // Very limited (Pagani Huayra = 100)
        else if (produced <= 250) score += 22;  // Limited edition (Rimac Nevera = 150)
        else if (produced <= 500) score += 18;  // Low production (LaFerrari = 499, McLaren P1 = 375)
        else if (produced <= 1000) score += 15; // Restricted (Porsche 918 = 918, McLaren 765LT)
        else if (produced <= 2000) score += 12; // Notable — Ford GT (1350), Carrera GT (1270)
        else if (produced <= 5000) score += 9;  // Modest (Ford GT 1st gen = 4038, Ferrari 488 Pista)
        else if (produced <= 10000) score += 6; // Semi-limited (Testarossa)
        else if (produced <= 20000) score += 4; // Low volume (Honda NSX, R34 GT-R)
        else score += 2;                        // Higher volume but still tracked
    }

    // Floor at 1, no ceiling
    return Math.max(1, Math.round(score));
}

/**
 * Get available years (next model year down to 1950).
 */
export function getYears() {
    const currentYear = new Date().getFullYear() + 1;
    const years = [];
    for (let y = currentYear; y >= 1950; y--) {
        years.push(y);
    }
    return years;
}

/**
 * Estimate MSRP for a given make/model.
 * Uses brand tier + production exclusivity for pricing.
 * Returns estimated dollar value or null if unknown.
 */
export function getEstimatedMSRP(make, model) {
    const makeLower = (make || '').toLowerCase();

    // ── Brand base MSRP tiers ──
    const brandBasePrices = {
        'bugatti': 2500000, 'pagani': 2800000, 'koenigsegg': 2000000,
        'rimac': 2100000, 'ssc': 1600000, 'hennessey': 1800000,
        'ferrari': 300000, 'lamborghini': 250000, 'mclaren': 220000,
        'aston martin': 180000, 'rolls-royce': 350000, 'bentley': 220000,
        'porsche': 100000, 'mercedes-amg': 120000, 'bmw m': 80000,
        'audi': 75000, 'lotus': 85000, 'maserati': 90000,
        'alfa romeo': 45000, 'de tomaso': 800000, 'shelby': 200000,
        'jaguar': 75000, 'genesis': 55000, 'alpine': 65000,
        'polestar': 55000, 'lucid': 80000,
        'tesla': 45000, 'rivian': 75000, 'dodge': 40000,
        'chevrolet': 35000, 'ford': 35000, 'nissan': 30000,
        'toyota': 30000, 'honda': 28000, 'subaru': 30000,
        'mazda': 28000, 'mitsubishi': 28000,
    };

    let basePrice = brandBasePrices[makeLower] || 35000;

    // ── Production-based MSRP multiplier ──
    const produced = getProductionCount(make, model);
    if (produced !== null) {
        if (produced <= 2) basePrice = Math.max(basePrice, 3500000);
        else if (produced <= 10) basePrice = Math.max(basePrice, 2800000);
        else if (produced <= 25) basePrice = Math.max(basePrice, 2000000);
        else if (produced <= 50) basePrice = Math.max(basePrice, 1500000);
        else if (produced <= 100) basePrice = Math.max(basePrice, 1000000);
        else if (produced <= 250) basePrice = Math.max(basePrice, 750000);
        else if (produced <= 500) basePrice = Math.max(basePrice, 500000);
        else if (produced <= 1000) basePrice = Math.max(basePrice, 300000);
        else if (produced <= 2000) basePrice = Math.max(basePrice, 200000);
        else if (produced <= 5000) basePrice = Math.max(basePrice, 150000);
    }

    // ── Specific well-known model overrides ──
    const overrides = {
        'Bugatti_Chiron': 3000000, 'Bugatti_Chiron Super Sport': 3900000,
        'Bugatti_Divo': 5800000, 'Bugatti_Centodieci': 9000000,
        'Bugatti_Mistral': 5000000, 'Bugatti_Bolide': 4700000,
        'Bugatti_Veyron': 1700000, 'Bugatti_Tourbillon': 3800000,
        'Pagani_Huayra': 2600000, 'Pagani_Utopia': 3400000,
        'Pagani_Zonda Cinque': 6500000,
        'Koenigsegg_Jesko': 3400000, 'Koenigsegg_Gemera': 1700000,
        'Koenigsegg_Agera One:1': 6000000, 'Koenigsegg_Regera': 1900000,
        'Rimac_Nevera': 2100000, 'Rimac_Concept S': 1500000,
        'Ferrari_LaFerrari': 1400000, 'Ferrari_LaFerrari Aperta': 2200000,
        'Ferrari_F40': 1500000, 'Ferrari_F50': 2500000,
        'Ferrari_Enzo': 3000000, 'Ferrari_Daytona SP3': 2250000,
        'Ferrari_SF90 Stradale': 625000, 'Ferrari_812 Superfast': 340000,
        'Ferrari_F80': 3600000, 'Ferrari_296 GTB': 320000,
        'Ferrari_Purosangue': 400000, 'Ferrari_Roma': 225000,
        'Ferrari_Monza SP1': 1750000, 'Ferrari_Monza SP2': 1800000,
        'Ferrari_488 Pista': 350000, 'Ferrari_288 GTO': 3000000,
        'Lamborghini_Revuelto': 600000, 'Lamborghini_Aventador SVJ': 575000,
        'Lamborghini_Huracan STO': 330000, 'Lamborghini_Veneno': 4500000,
        'Lamborghini_Sian': 3600000, 'Lamborghini_Centenario': 2500000,
        'Lamborghini_Countach LPI 800-4': 2600000,
        'Lamborghini_Miura': 1500000, 'Lamborghini_Urus': 230000,
        'McLaren_F1': 20000000, 'McLaren_P1': 1150000,
        'McLaren_Speedtail': 2250000, 'McLaren_Senna': 1000000,
        'McLaren_Elva': 1700000, 'McLaren_Solus GT': 3500000,
        'McLaren_W1': 2100000, 'McLaren_720S': 300000,
        'Porsche_918 Spyder': 850000, 'Porsche_Carrera GT': 750000,
        'Porsche_911 GT2 RS': 295000, 'Porsche_911 GT3 RS': 225000,
        'Porsche_911 Turbo S': 230000, 'Porsche_Taycan Turbo GT': 230000,
        'Aston Martin_Valkyrie': 3200000, 'Aston Martin_One-77': 1850000,
        'Aston Martin_Vulcan': 2300000, 'Aston Martin_Victor': 3000000,
        'Aston Martin_DB10': 3500000, 'Aston Martin_DBS Superleggera': 320000,
        'Mercedes-AMG_One': 2700000, 'Mercedes-AMG_GT Black Series': 325000,
        'Rolls-Royce_Phantom': 460000, 'Rolls-Royce_Spectre': 420000,
        'Bentley_Batur': 1800000, 'Bentley_Bacalar': 1900000,
        'Toyota_2000GT': 1000000, 'Toyota_LFA': 400000,
        'Honda_NSX Type S': 170000,
        'Ford_GT': 500000, 'Ford_GT (2nd Gen)': 500000,
        'Jaguar_XJ220': 750000, 'Jaguar_C-X75': 1000000,
        'Alfa Romeo_33 Stradale': 2000000,
        'Shelby_Cobra 427': 4000000, 'Shelby_Daytona Coupe': 20000000,
    };

    const key = `${make}_${model}`;
    if (overrides[key]) return overrides[key];

    return basePrice;
}
