export interface CountryZone {
  id: string;
  name: string;
  countryId: string;
  countryName: string;
  flag: string;
  bounds: [[number, number], [number, number]]; // [[south, west], [north, east]]
  centroid: [number, number];
  zoom: number;
  fireEcology: string;
  peakMonths: string;
  keyProvinces: string[];
  riskLevel: 'CRITICAL' | 'ELEVATED' | 'NOMINAL' | 'SUPPRESSED';
  color: string;
}

export interface CountryMeta {
  id: string;
  name: string;
  flag: string;
  center: [number, number];
  zoom: number;
  description: string;
}

export const COUNTRIES: CountryMeta[] = [
  {
    id: 'all',
    name: 'All Asia',
    flag: '🌏',
    center: [25.0, 80.0],
    zoom: 4,
    description: 'Transboundary Pan-Asian domain spanning 9 countries and 20.9M NASA fire detections.'
  },
  {
    id: 'india',
    name: 'India',
    flag: '🇮🇳',
    center: [22.5, 82.0],
    zoom: 5,
    description: 'Post-monsoon agricultural burning in the northwest and spring deciduous forest fires in central/eastern belts.'
  },
  {
    id: 'china',
    name: 'China',
    flag: '🇨🇳',
    center: [28.0, 110.0],
    zoom: 5,
    description: 'Intensive agricultural residue burning in the Yangtze river basin and southern subtropical hill clearings.'
  },
  {
    id: 'pakistan',
    name: 'Pakistan',
    flag: '🇵🇰',
    center: [29.0, 70.0],
    zoom: 6,
    description: 'Rice-wheat cropping residues across Punjab canal colonies and lower Indus river basin in Sindh.'
  },
  {
    id: 'afghanistan',
    name: 'Afghanistan',
    flag: '🇦🇫',
    center: [33.0, 65.0],
    zoom: 6,
    description: 'Arid irrigated valley residue burns along the Helmand river and northern Amu Darya agricultural margins.'
  },
  {
    id: 'iran',
    name: 'Eastern Iran',
    flag: '🇮🇷',
    center: [30.0, 58.0],
    zoom: 6,
    description: 'Semi-arid pastoral scrub burning and Sistan-Baluchistan wetland depression agricultural clearing.'
  },
  {
    id: 'malaysia',
    name: 'Malaysia',
    flag: '🇲🇾',
    center: [4.0, 102.5],
    zoom: 6,
    description: 'Tropical peatland smoldering, oil palm residue disposal, and agricultural land clearing.'
  },
  {
    id: 'nepal_bhutan',
    name: 'Nepal & Bhutan',
    flag: '🇳🇵',
    center: [28.0, 86.0],
    zoom: 7,
    description: 'Terai lowland agricultural/forest burns and sub-Himalayan pine forest fires during pre-monsoon dry season.'
  },
  {
    id: 'sri_lanka',
    name: 'Sri Lanka',
    flag: '🇱🇰',
    center: [7.8, 80.7],
    zoom: 8,
    description: 'Dry zone shifting cultivation (chena) burning and scrub clearing during inter-monsoon periods.'
  }
];

export const COUNTRY_ZONES: CountryZone[] = [
  // ================= INDIA =================
  {
    id: 'in_north_agri',
    name: 'Indo-Gangetic Agricultural Belt',
    countryId: 'india',
    countryName: 'India',
    flag: '🇮🇳',
    bounds: [[28.5, 73.5], [32.5, 78.5]],
    centroid: [30.5, 75.8],
    zoom: 7,
    fireEcology: 'High-intensity post-monsoon paddy residue burning & spring wheat stubble clearing.',
    peakMonths: 'October – November & April – May',
    keyProvinces: ['Punjab (Sangrur, Bathinda, Ludhiana)', 'Haryana (Kaithal, Karnal)', 'W. Uttar Pradesh'],
    riskLevel: 'ELEVATED',
    color: '#f97316'
  },
  {
    id: 'in_central_forest',
    name: 'Central Deciduous Forest Belt',
    countryId: 'india',
    countryName: 'India',
    flag: '🇮🇳',
    bounds: [[19.5, 78.0], [24.5, 85.5]],
    centroid: [22.8, 81.5],
    zoom: 6,
    fireEcology: 'Dry deciduous forest understory fires, leaf-litter clearing, and mahua flower collection burns.',
    peakMonths: 'March – May (Spring Peak)',
    keyProvinces: ['Madhya Pradesh (Bandhavgarh, Kanha fringes)', 'Chhattisgarh (Bastar, Bilaspur)', 'Odisha (Similipal)'],
    riskLevel: 'NOMINAL',
    color: '#eab308'
  },
  {
    id: 'in_northeast_hills',
    name: 'Northeast Hilly Shifting Cultivation Belt',
    countryId: 'india',
    countryName: 'India',
    flag: '🇮🇳',
    bounds: [[23.0, 91.0], [27.5, 96.5]],
    centroid: [25.5, 93.5],
    zoom: 7,
    fireEcology: 'Traditional jhum (slash-and-burn) shifting cultivation on steep subtropical hill slopes.',
    peakMonths: 'February – April',
    keyProvinces: ['Assam (Karbi Anglong)', 'Mizoram', 'Manipur', 'Nagaland', 'Arunachal Foothills'],
    riskLevel: 'NOMINAL',
    color: '#38bdf8'
  },
  {
    id: 'in_western_ghats',
    name: 'Western Ghats & Deccan Margin',
    countryId: 'india',
    countryName: 'India',
    flag: '🇮🇳',
    bounds: [[14.0, 73.5], [19.5, 77.5]],
    centroid: [16.5, 75.0],
    zoom: 7,
    fireEcology: 'Moist deciduous edge clearing and post-harvest sugarcane field burns.',
    peakMonths: 'January – March',
    keyProvinces: ['Maharashtra (Kolhapur, Satara)', 'Karnataka (Belagavi, Shimoga)', 'Goa hinterlands'],
    riskLevel: 'SUPPRESSED',
    color: '#38bdf8'
  },
  {
    id: 'in_northwest_arid',
    name: 'Thar Desert & Gujarat Plains',
    countryId: 'india',
    countryName: 'India',
    flag: '🇮🇳',
    bounds: [[21.5, 69.0], [27.0, 74.0]],
    centroid: [24.5, 71.5],
    zoom: 7,
    fireEcology: 'Semi-arid scrub clearing, groundnut and cotton crop trash burning.',
    peakMonths: 'November – January & May',
    keyProvinces: ['Gujarat (Saurashtra, Kutch)', 'Rajasthan (Jodhpur, Bikaner fringes)'],
    riskLevel: 'SUPPRESSED',
    color: '#38bdf8'
  },

  // ================= CHINA =================
  {
    id: 'cn_yangtze',
    name: 'Yangtze River Agricultural Basin',
    countryId: 'china',
    countryName: 'China',
    flag: '🇨🇳',
    bounds: [[26.0, 110.0], [31.5, 116.5]],
    centroid: [28.5, 113.0],
    zoom: 6,
    fireEcology: 'Intensive seasonal double-crop rice and rapeseed stubble burning across alluvial plains.',
    peakMonths: 'May – June & October – November',
    keyProvinces: ['Hunan', 'Hubei', 'Jiangxi (Poyang Lake Basin)', 'Anhui'],
    riskLevel: 'NOMINAL',
    color: '#eab308'
  },
  {
    id: 'cn_south_forest',
    name: 'Southern Subtropical Hill Zone',
    countryId: 'china',
    countryName: 'China',
    flag: '🇨🇳',
    bounds: [[21.5, 105.0], [26.0, 115.0]],
    centroid: [23.5, 109.5],
    zoom: 6,
    fireEcology: 'Sugarcane trash disposal, eucalyptus plantation preparation, and hilly orchard burning.',
    peakMonths: 'December – March',
    keyProvinces: ['Guangxi', 'Guangdong (Leizhou Peninsula)', 'Yunnan (South)'],
    riskLevel: 'NOMINAL',
    color: '#38bdf8'
  },
  {
    id: 'cn_north_plain',
    name: 'North China Agricultural Plain',
    countryId: 'china',
    countryName: 'China',
    flag: '🇨🇳',
    bounds: [[33.0, 112.0], [38.0, 119.0]],
    centroid: [35.5, 115.5],
    zoom: 6,
    fireEcology: 'Intense short-duration summer wheat straw burning followed by autumn corn stalk clearing.',
    peakMonths: 'June & October',
    keyProvinces: ['Henan', 'Shandong', 'Hebei', 'Northern Anhui'],
    riskLevel: 'SUPPRESSED',
    color: '#38bdf8'
  },

  // ================= PAKISTAN =================
  {
    id: 'pk_punjab_indus',
    name: 'Upper Indus Agricultural Belt',
    countryId: 'pakistan',
    countryName: 'Pakistan',
    flag: '🇵🇰',
    bounds: [[29.5, 71.0], [33.0, 75.0]],
    centroid: [31.5, 73.5],
    zoom: 7,
    fireEcology: 'Concentrated post-harvest rice straw burning directly contributing to transboundary winter smog.',
    peakMonths: 'October – November & April – May',
    keyProvinces: ['Punjab (Sheikhupura, Gujranwala, Hafizabad, Faisalabad, Kasur)'],
    riskLevel: 'ELEVATED',
    color: '#f97316'
  },
  {
    id: 'pk_sindh_lower',
    name: 'Lower Indus River Basin & Delta',
    countryId: 'pakistan',
    countryName: 'Pakistan',
    flag: '🇵🇰',
    bounds: [[24.5, 67.5], [28.5, 70.5]],
    centroid: [26.5, 68.8],
    zoom: 7,
    fireEcology: 'Sugarcane and rice residue disposal along major canal barrages and Indus delta wetlands.',
    peakMonths: 'November – January',
    keyProvinces: ['Sindh (Larkana, Sukkur, Shaheed Benazirabad, Hyderabad)'],
    riskLevel: 'NOMINAL',
    color: '#eab308'
  },
  {
    id: 'pk_baluchistan_scrub',
    name: 'Baluchistan Arid Scrub Plateau',
    countryId: 'pakistan',
    countryName: 'Pakistan',
    flag: '🇵🇰',
    bounds: [[26.0, 62.0], [30.5, 67.5]],
    centroid: [28.5, 65.0],
    zoom: 6,
    fireEcology: 'Sparse desert rangeland burning, date palm grove pruning fires, and pastoral brush fires.',
    peakMonths: 'May – July',
    keyProvinces: ['Baluchistan (Chagai, Kech, Khuzdar)'],
    riskLevel: 'SUPPRESSED',
    color: '#38bdf8'
  },

  // ================= AFGHANISTAN =================
  {
    id: 'af_helmand_basin',
    name: 'Helmand River Agricultural Oasis',
    countryId: 'afghanistan',
    countryName: 'Afghanistan',
    flag: '🇦🇫',
    bounds: [[30.5, 63.5], [32.8, 66.5]],
    centroid: [31.5, 64.8],
    zoom: 7,
    fireEcology: 'Irrigated alluvial crop residue burning (wheat and seasonal cash crops) along river valleys.',
    peakMonths: 'June – July & October',
    keyProvinces: ['Helmand (Lashkargah)', 'Kandahar (Arghandab valley)'],
    riskLevel: 'NOMINAL',
    color: '#38bdf8'
  },
  {
    id: 'af_north_plains',
    name: 'Northern Amu Darya Plains',
    countryId: 'afghanistan',
    countryName: 'Afghanistan',
    flag: '🇦🇫',
    bounds: [[35.5, 65.5], [37.5, 70.0]],
    centroid: [36.5, 68.0],
    zoom: 7,
    fireEcology: 'Post-harvest cereal stubble burning on loess plains bordering Central Asia.',
    peakMonths: 'July – August',
    keyProvinces: ['Kunduz', 'Balkh (Mazar-i-Sharif)', 'Baghlan'],
    riskLevel: 'SUPPRESSED',
    color: '#38bdf8'
  },

  // ================= EASTERN IRAN =================
  {
    id: 'ir_sistan_basin',
    name: 'Sistan Basin & Hamun Depression',
    countryId: 'iran',
    countryName: 'Eastern Iran',
    flag: '🇮🇷',
    bounds: [[29.0, 60.5], [31.5, 62.0]],
    centroid: [30.5, 61.3],
    zoom: 8,
    fireEcology: 'Desiccated wetland reedbed burning and sparse irrigated agriculture stubble disposal.',
    peakMonths: 'September – November',
    keyProvinces: ['Sistan and Baluchestan (Zabol, Hirmand)'],
    riskLevel: 'NOMINAL',
    color: '#38bdf8'
  },
  {
    id: 'ir_kerman_oases',
    name: 'Kerman & Lut Desert Margins',
    countryId: 'iran',
    countryName: 'Eastern Iran',
    flag: '🇮🇷',
    bounds: [[27.5, 56.5], [30.5, 59.5]],
    centroid: [29.0, 58.0],
    zoom: 7,
    fireEcology: 'Pistachio and date palm agricultural residue burning on desert oasis peripheries.',
    peakMonths: 'October – December',
    keyProvinces: ['Kerman (Bam, Jiroft)', 'Hormozgan hinterland'],
    riskLevel: 'SUPPRESSED',
    color: '#38bdf8'
  },

  // ================= MALAYSIA =================
  {
    id: 'my_peninsular_peat',
    name: 'Peninsular Malaysia Peatland & Coastal Belt',
    countryId: 'malaysia',
    countryName: 'Malaysia',
    flag: '🇲🇾',
    bounds: [[1.5, 100.5], [4.5, 104.0]],
    centroid: [3.2, 102.0],
    zoom: 7,
    fireEcology: 'Subsurface deep peat smoldering and agricultural clearing for oil palm plantations.',
    peakMonths: 'June – August (Dry season; suppressed in Nov by monsoon)',
    keyProvinces: ['Selangor (Kuala Langat peat)', 'Pahang (Pekan)', 'Johor (Muar)'],
    riskLevel: 'SUPPRESSED',
    color: '#38bdf8'
  },
  {
    id: 'my_borneo_tropical',
    name: 'Borneo Peatland & Forest Margin',
    countryId: 'malaysia',
    countryName: 'Malaysia',
    flag: '🇲🇾',
    bounds: [[1.0, 110.0], [5.0, 116.5]],
    centroid: [2.8, 113.0],
    zoom: 6,
    fireEcology: 'Tropical forest fringe clearing, timber concession residue burns, and peat swamp fires.',
    peakMonths: 'July – September',
    keyProvinces: ['Sarawak (Miri, Sibu, Bintulu)', 'Sabah (Keningau)'],
    riskLevel: 'SUPPRESSED',
    color: '#38bdf8'
  },

  // ================= NEPAL & BHUTAN =================
  {
    id: 'np_terai_belt',
    name: 'Nepal Terai & Sal Forest Belt',
    countryId: 'nepal_bhutan',
    countryName: 'Nepal & Bhutan',
    flag: '🇳🇵',
    bounds: [[26.5, 80.0], [28.5, 88.0]],
    centroid: [27.5, 84.5],
    zoom: 7,
    fireEcology: 'Agricultural field stubble burning and Shorea robusta (Sal) deciduous forest understory fires.',
    peakMonths: 'March – May',
    keyProvinces: ['Chitwan', 'Lumbini (Rupandehi)', 'Kailali', 'Morang'],
    riskLevel: 'NOMINAL',
    color: '#38bdf8'
  },
  {
    id: 'bt_sub_himalaya',
    name: 'Bhutan Sub-Himalayan Foothills',
    countryId: 'nepal_bhutan',
    countryName: 'Nepal & Bhutan',
    flag: '🇧🇹',
    bounds: [[26.7, 89.0], [27.8, 92.0]],
    centroid: [27.2, 90.5],
    zoom: 8,
    fireEcology: 'Chir pine dry forest slope fires and southern borderland shifting agro-forestry burns.',
    peakMonths: 'February – April',
    keyProvinces: ['Sarpang', 'Samdrup Jongkhar', 'Punakha-Wangdue valleys'],
    riskLevel: 'SUPPRESSED',
    color: '#38bdf8'
  },

  // ================= SRI LANKA =================
  {
    id: 'lk_dry_zone',
    name: 'Sri Lanka Dry Zone Chena Belt',
    countryId: 'sri_lanka',
    countryName: 'Sri Lanka',
    flag: '🇱🇰',
    bounds: [[7.5, 80.0], [9.5, 81.5]],
    centroid: [8.5, 80.7],
    zoom: 8,
    fireEcology: 'Traditional chena (slash-and-burn) clearing in dry thorn scrub and tank cascade valleys.',
    peakMonths: 'July – September (Yala dry season)',
    keyProvinces: ['North Central (Anuradhapura, Polonnaruwa)', 'Eastern (Batticaloa, Vavuniya)'],
    riskLevel: 'SUPPRESSED',
    color: '#38bdf8'
  }
];
