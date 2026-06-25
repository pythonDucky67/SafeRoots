"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const crypto_1 = require("crypto");
const db = (0, db_1.getDb)();
function hashPassword(password) {
    const salt = (0, crypto_1.randomBytes)(16).toString('hex');
    const hash = (0, crypto_1.scryptSync)(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}
// ─── Shelters ─────────────────────────────────────────────────────────────────
const shelters = [
    {
        id: 'shelter-001',
        name: "Women's Center of Greater Harlem",
        address: '200 W 126th St',
        city: 'New York', state: 'NY',
        lat: 40.8086, lng: -73.9530,
        phone: '(212) 555-0101',
        website: 'https://example.org/wcgh',
        tags: ['women-only', 'bipoc-focused', 'accessible'],
        capacity: 85, currentOccupancy: 62,
        rating: 4.7, reviewCount: 134,
        services: ['Hot meals', 'Counseling', 'Job training', 'Childcare', 'Clothing'],
        hours: '24/7',
        description: 'A women-only emergency shelter prioritising BIPOC women and families. Offers job training, counseling, and childcare under one roof.',
    },
    {
        id: 'shelter-002',
        name: 'Rainbow Safe House NYC',
        address: '357 West St',
        city: 'New York', state: 'NY',
        lat: 40.7367, lng: -74.0082,
        phone: '(212) 555-0102',
        website: null,
        tags: ['lgbtq-friendly', 'accessible'],
        capacity: 40, currentOccupancy: 31,
        rating: 4.9, reviewCount: 89,
        services: ['Mental health', 'Legal aid', 'HIV services', 'Peer support'],
        hours: '24/7',
        description: 'A LGBTQ+-dedicated safe house with gender-affirming staff and trauma-informed care. Prioritises transgender and non-binary individuals.',
    },
    {
        id: 'shelter-003',
        name: 'Haven House Los Angeles',
        address: '1340 S Figueroa St',
        city: 'Los Angeles', state: 'CA',
        lat: 34.0378, lng: -118.2681,
        phone: '(213) 555-0201',
        website: 'https://example.org/haven-la',
        tags: ['women-only', 'accessible', 'childcare', 'domestic-violence'],
        capacity: 120, currentOccupancy: 91,
        rating: 4.6, reviewCount: 200,
        services: ['24h security', 'Childcare', 'Legal aid', 'DV counseling', 'Medical clinic'],
        hours: '24/7',
        description: 'LA\'s largest women-only shelter offering specialised domestic violence programming, on-site childcare, and a medical clinic.',
    },
    {
        id: 'shelter-004',
        name: 'LA LGBT Center Emergency Housing',
        address: '1625 N Schrader Blvd',
        city: 'Los Angeles', state: 'CA',
        lat: 34.0985, lng: -118.3342,
        phone: '(323) 555-0202',
        website: 'https://example.org/lalgbt',
        tags: ['lgbtq-friendly', 'accessible', 'pets-allowed'],
        capacity: 65, currentOccupancy: 48,
        rating: 4.8, reviewCount: 176,
        services: ['HIV/AIDS care', 'Mental health', 'Employment', 'Legal', 'Pets allowed'],
        hours: '24/7',
        description: 'Emergency housing for LGBTQ+ individuals including families and seniors. Pets welcome. Full wraparound services on campus.',
    },
    {
        id: 'shelter-005',
        name: "Sarah's Circle",
        address: '4838 N Sheridan Rd',
        city: 'Chicago', state: 'IL',
        lat: 41.9673, lng: -87.6523,
        phone: '(773) 555-0301',
        website: 'https://example.org/sarahs-circle',
        tags: ['women-only', 'accessible'],
        capacity: 75, currentOccupancy: 60,
        rating: 4.5, reviewCount: 112,
        services: ['Case management', 'Housing search', 'Employment readiness', 'Food pantry'],
        hours: '24/7',
        description: 'Chicago\'s oldest women-only homeless shelter, providing a safe haven and path to permanent housing for women of all backgrounds.',
    },
    {
        id: 'shelter-006',
        name: 'Broadway Youth Center Chicago',
        address: '3179 N Broadway',
        city: 'Chicago', state: 'IL',
        lat: 41.9368, lng: -87.6464,
        phone: '(773) 555-0302',
        website: null,
        tags: ['lgbtq-friendly', 'bipoc-focused'],
        capacity: 30, currentOccupancy: 22,
        rating: 4.7, reviewCount: 64,
        services: ['Drop-in', 'Showers', 'Meals', 'Case management', 'Peer support'],
        hours: 'Mon–Fri 10am–8pm',
        description: 'Drop-in centre serving LGBTQ+ and BIPOC youth experiencing homelessness. Transitional housing referrals and peer-led programming.',
    },
    {
        id: 'shelter-007',
        name: 'Star of Hope Women & Family Center',
        address: '419 Dowling St',
        city: 'Houston', state: 'TX',
        lat: 29.7283, lng: -95.3730,
        phone: '(713) 555-0401',
        website: 'https://example.org/star-of-hope',
        tags: ['women-only', 'childcare', 'accessible'],
        capacity: 200, currentOccupancy: 158,
        rating: 4.4, reviewCount: 267,
        services: ['Childcare', 'GED classes', 'Job training', 'Medical', 'Counseling'],
        hours: '24/7',
        description: 'Large family-focused shelter for women and children. Comprehensive education and workforce development programmes.',
    },
    {
        id: 'shelter-008',
        name: 'Montrose Center Houston',
        address: '401 Branard St',
        city: 'Houston', state: 'TX',
        lat: 29.7411, lng: -95.3846,
        phone: '(713) 555-0402',
        website: 'https://example.org/montrose-center',
        tags: ['lgbtq-friendly', 'accessible'],
        capacity: 40, currentOccupancy: 28,
        rating: 4.8, reviewCount: 93,
        services: ['Mental health', 'Senior services', 'HIV testing', 'DV support'],
        hours: 'Mon–Sat 9am–6pm',
        description: 'LGBTQ+-affirming community centre with emergency housing referrals, mental health services, and DV support for queer survivors.',
    },
    {
        id: 'shelter-009',
        name: "My Sister's House",
        address: '963 Memorial Dr SW',
        city: 'Atlanta', state: 'GA',
        lat: 33.7386, lng: -84.4106,
        phone: '(404) 555-0501',
        website: 'https://example.org/msh',
        tags: ['women-only', 'bipoc-focused', 'domestic-violence'],
        capacity: 60, currentOccupancy: 54,
        rating: 4.9, reviewCount: 108,
        services: ['DV counseling', 'Legal clinic', 'Children\'s services', 'Economic empowerment'],
        hours: '24/7 crisis line',
        description: 'Atlanta\'s premier shelter for BIPOC women and children fleeing domestic violence. Culturally responsive services and legal clinic.',
    },
    {
        id: 'shelter-010',
        name: 'Lost-n-Found Youth',
        address: '44 Peachtree Pl NW',
        city: 'Atlanta', state: 'GA',
        lat: 33.7682, lng: -84.3908,
        phone: '(404) 555-0502',
        website: 'https://example.org/lnf',
        tags: ['lgbtq-friendly', 'bipoc-focused'],
        capacity: 25, currentOccupancy: 17,
        rating: 4.8, reviewCount: 55,
        services: ['Transitional housing', 'Mental health', 'Life skills', 'Job placement'],
        hours: 'Mon–Fri 9am–5pm',
        description: 'Housing and support for LGBTQ+ youth ages 18–24 who are homeless or at risk, with a focus on BIPOC youth.',
    },
    {
        id: 'shelter-011',
        name: 'La Casa de las Madres',
        address: '1663 Mission St',
        city: 'San Francisco', state: 'CA',
        lat: 37.7704, lng: -122.4196,
        phone: '(415) 555-0601',
        website: 'https://example.org/lcm',
        tags: ['women-only', 'bipoc-focused', 'childcare', 'domestic-violence'],
        capacity: 80, currentOccupancy: 65,
        rating: 4.7, reviewCount: 145,
        services: ['DV shelter', 'Legal aid', 'Childcare', 'Spanish services', 'Economic literacy'],
        hours: '24/7 hotline',
        description: 'SF\'s oldest domestic violence agency, serving survivors of all backgrounds with bilingual (English/Spanish) culturally competent care.',
    },
    {
        id: 'shelter-012',
        name: 'Covenant House California',
        address: '1695 Polk St',
        city: 'San Francisco', state: 'CA',
        lat: 37.7885, lng: -122.4222,
        phone: '(415) 555-0602',
        website: 'https://example.org/covenant',
        tags: ['lgbtq-friendly', 'accessible', 'pets-allowed'],
        capacity: 100, currentOccupancy: 72,
        rating: 4.6, reviewCount: 188,
        services: ['Transitional housing', 'Mental health', 'Education', 'Street outreach'],
        hours: '24/7',
        description: 'Housing and crisis services for young adults 18–24 who are homeless, with strong LGBTQ+ affirming programming and pet-friendly units.',
    },
    {
        id: 'shelter-013',
        name: 'YWCA Seattle | King | Snohomish',
        address: '1118 5th Ave',
        city: 'Seattle', state: 'WA',
        lat: 47.6088, lng: -122.3303,
        phone: '(206) 555-0701',
        website: 'https://example.org/ywca-seattle',
        tags: ['women-only', 'accessible', 'childcare'],
        capacity: 150, currentOccupancy: 112,
        rating: 4.5, reviewCount: 220,
        services: ['Emergency shelter', 'Childcare', 'Housing counseling', 'Job training', 'DV services'],
        hours: '24/7',
        description: 'Comprehensive shelter and support for women and families with a long history of racial justice work. On-site childcare and workforce programs.',
    },
    {
        id: 'shelter-014',
        name: 'Sojourner Center',
        address: '2530 E McDowell Rd',
        city: 'Phoenix', state: 'AZ',
        lat: 33.4726, lng: -112.0099,
        phone: '(602) 555-0801',
        website: 'https://example.org/sojourner',
        tags: ['women-only', 'childcare', 'domestic-violence', 'accessible'],
        capacity: 180, currentOccupancy: 140,
        rating: 4.6, reviewCount: 195,
        services: ['DV shelter', 'Childcare center', 'Legal advocacy', 'Economic empowerment', 'Support groups'],
        hours: '24/7',
        description: 'One of Arizona\'s largest DV shelters, offering crisis housing for women and children with an on-site licensed childcare centre.',
    },
    {
        id: 'shelter-015',
        name: 'Casa de Paz',
        address: '700 E Buckeye Rd',
        city: 'Phoenix', state: 'AZ',
        lat: 33.4449, lng: -112.0446,
        phone: '(602) 555-0802',
        website: null,
        tags: ['bipoc-focused', 'accessible', 'lgbtq-friendly'],
        capacity: 50, currentOccupancy: 38,
        rating: 4.7, reviewCount: 71,
        services: ['Immigration support', 'Deportation defense', 'Mental health', 'Food pantry'],
        hours: 'Mon–Sat 8am–7pm',
        description: 'Culturally responsive shelter for immigrant communities, BIPOC individuals, and LGBTQ+ people facing housing instability or deportation threat.',
    },
];
// ─── Resources ────────────────────────────────────────────────────────────────
const resources = [
    {
        id: 'resource-001',
        name: 'NYC Food Bank',
        category: 'food',
        description: 'Emergency food distributions and pantry access across all five boroughs. No documentation required.',
        address: '39 Broadway', city: 'New York', state: 'NY',
        phone: '(212) 566-7855', website: 'https://www.foodbanknyc.org',
        hours: 'Mon–Fri 9am–5pm',
        tags: ['women-friendly', 'bipoc-friendly', 'no-id-required'],
        lat: 40.7071, lng: -74.0131, isFree: true,
    },
    {
        id: 'resource-002',
        name: "Women's Health Initiative NYC",
        category: 'healthcare',
        description: 'Free reproductive health, prenatal care, and mental health services for women who are uninsured or underinsured.',
        address: '545 W 45th St', city: 'New York', state: 'NY',
        phone: '(212) 555-1102', website: null,
        hours: 'Mon–Sat 8am–5pm',
        tags: ['women-only', 'reproductive-health', 'multilingual'],
        lat: 40.7596, lng: -73.9940, isFree: true,
    },
    {
        id: 'resource-003',
        name: 'Lambda Legal Help Desk',
        category: 'legal-aid',
        description: 'Free legal information and referrals for LGBTQ+ people facing discrimination in housing, employment, and healthcare.',
        address: '120 Wall St', city: 'New York', state: 'NY',
        phone: '(212) 809-8585', website: 'https://www.lambdalegal.org',
        hours: 'Mon–Fri 10am–4pm',
        tags: ['lgbtq-focused', 'discrimination', 'housing-rights'],
        lat: 40.7068, lng: -74.0090, isFree: true,
    },
    {
        id: 'resource-004',
        name: 'Trevor Project (National Hotline)',
        category: 'mental-health',
        description: 'Crisis intervention and suicide prevention for LGBTQ+ young people ages 13–25. Available 24/7 by phone, text, or chat.',
        address: 'National', city: 'National', state: 'NA',
        phone: '1-866-488-7386', website: 'https://www.thetrevorproject.org',
        hours: '24/7',
        tags: ['lgbtq-youth', 'crisis', 'online-chat'],
        lat: 34.0522, lng: -118.2437, isFree: true,
    },
    {
        id: 'resource-005',
        name: 'LA Mission Food Pantry',
        category: 'food',
        description: 'Daily hot meals and grocery distribution. Specialised programmes for women and families.',
        address: '303 E 5th St', city: 'Los Angeles', state: 'CA',
        phone: '(213) 629-1227', website: 'https://www.lamission.org',
        hours: 'Daily 7am–7pm',
        tags: ['families', 'women-friendly', 'daily-meals'],
        lat: 34.0466, lng: -118.2457, isFree: true,
    },
    {
        id: 'resource-006',
        name: 'Planned Parenthood of LA',
        category: 'healthcare',
        description: 'Reproductive health, STI testing/treatment, contraception, and gender-affirming hormone therapy on sliding scale.',
        address: '1045 Gayley Ave', city: 'Los Angeles', state: 'CA',
        phone: '(800) 576-5544', website: 'https://www.plannedparenthood.org',
        hours: 'Mon–Sat 8am–5pm',
        tags: ['reproductive-health', 'trans-healthcare', 'sliding-scale'],
        lat: 34.0643, lng: -118.4457, isFree: false,
    },
    {
        id: 'resource-007',
        name: 'Asian Americans Advancing Justice – LA',
        category: 'legal-aid',
        description: 'Free immigration legal services, housing rights, and civil rights advocacy for Asian and Pacific Islander communities.',
        address: '1145 Wilshire Blvd', city: 'Los Angeles', state: 'CA',
        phone: '(213) 977-7500', website: 'https://www.advancingjustice-la.org',
        hours: 'Mon–Fri 9am–5pm',
        tags: ['immigration', 'asian-community', 'housing-rights'],
        lat: 34.0565, lng: -118.2607, isFree: true,
    },
    {
        id: 'resource-008',
        name: 'Greater Chicago Food Depository',
        category: 'food',
        description: 'Network of 700+ food pantries. Mobile pantry schedule available. Culturally familiar foods for many communities.',
        address: '4100 W Ann Lurie Pl', city: 'Chicago', state: 'IL',
        phone: '(773) 247-3663', website: 'https://www.gcfd.org',
        hours: 'Pantry hours vary by location',
        tags: ['network', 'multilingual', 'halal-kosher-options'],
        lat: 41.8647, lng: -87.7249, isFree: true,
    },
    {
        id: 'resource-009',
        name: 'Cook County Legal Aid',
        category: 'legal-aid',
        description: 'Free civil legal services for low-income residents. Specialised units for housing eviction, DV, and family law.',
        address: '16 N Dearborn St', city: 'Chicago', state: 'IL',
        phone: '(312) 603-1280', website: 'https://www.cookcountyil.gov/legal-aid',
        hours: 'Mon–Fri 8:30am–4:30pm',
        tags: ['eviction-defense', 'family-law', 'domestic-violence'],
        lat: 41.8827, lng: -87.6293, isFree: true,
    },
    {
        id: 'resource-010',
        name: 'National DV Hotline',
        category: 'domestic-violence',
        description: 'Confidential support, safety planning, and referrals for survivors of domestic violence, sexual assault, and stalking.',
        address: 'National', city: 'National', state: 'NA',
        phone: '1-800-799-7233', website: 'https://www.thehotline.org',
        hours: '24/7',
        tags: ['crisis', 'confidential', 'safety-planning', 'multilingual'],
        lat: 30.2672, lng: -97.7431, isFree: true,
    },
    {
        id: 'resource-011',
        name: 'Houston Food Bank',
        category: 'food',
        description: 'Largest food bank in the US. Pantry locator for Houston metro. No eligibility requirements for basic services.',
        address: '535 Portwall St', city: 'Houston', state: 'TX',
        phone: '(832) 369-9390', website: 'https://www.houstonfoodbank.org',
        hours: 'Mon–Sat 8am–5pm',
        tags: ['large-scale', 'no-id-required', 'spanish-language'],
        lat: 29.7499, lng: -95.2962, isFree: true,
    },
    {
        id: 'resource-012',
        name: 'Harris Health System',
        category: 'healthcare',
        description: 'Affordable primary and specialty care for uninsured Harris County residents. Sliding-scale fees. LGBTQ+-welcoming.',
        address: '2525 Holly Hall St', city: 'Houston', state: 'TX',
        phone: '(713) 634-1000', website: 'https://www.harrishealth.org',
        hours: 'Mon–Fri 7am–6pm',
        tags: ['sliding-scale', 'primary-care', 'lgbtq-welcoming'],
        lat: 29.6907, lng: -95.4013, isFree: false,
    },
    {
        id: 'resource-013',
        name: 'Dress for Success Atlanta',
        category: 'employment',
        description: 'Professional attire and career development for women entering or returning to the workforce. Interview coaching included.',
        address: '235 Peachtree St NE', city: 'Atlanta', state: 'GA',
        phone: '(404) 523-6000', website: 'https://atlanta.dressforsuccess.org',
        hours: 'Tue & Thu 10am–2pm',
        tags: ['women-only', 'career', 'professional-clothing'],
        lat: 33.7571, lng: -84.3879, isFree: true,
    },
    {
        id: 'resource-014',
        name: 'SF-Marin Food Bank',
        category: 'food',
        description: 'Weekly pantry distribution at 280+ partner sites across SF and Marin. No documentation or proof of income required.',
        address: '900 Pennsylvania Ave', city: 'San Francisco', state: 'CA',
        phone: '(415) 282-1900', website: 'https://www.sfmfoodbank.org',
        hours: 'Mon–Sat 8am–4pm',
        tags: ['no-id-required', 'vegetables', 'multilingual'],
        lat: 37.7548, lng: -122.3890, isFree: true,
    },
    {
        id: 'resource-015',
        name: 'SF Free Clinic',
        category: 'healthcare',
        description: 'Volunteer-run primary care, dental, and mental health services for uninsured adults. No appointment required.',
        address: '4900 California St', city: 'San Francisco', state: 'CA',
        phone: '(415) 750-9894', website: 'https://www.sffreeclinic.org',
        hours: 'Sat 9am–1pm (walk-in)',
        tags: ['walk-in', 'no-insurance', 'mental-health', 'dental'],
        lat: 37.7862, lng: -122.4710, isFree: true,
    },
    {
        id: 'resource-016',
        name: 'Community Legal Services Phoenix',
        category: 'legal-aid',
        description: 'Free civil legal aid for low-income Arizonans: housing, family, immigration, benefits. Strong DV unit.',
        address: '305 S 2nd Ave', city: 'Phoenix', state: 'AZ',
        phone: '(602) 258-3434', website: 'https://www.clsaz.org',
        hours: 'Mon–Fri 8am–5pm',
        tags: ['immigration', 'housing', 'domestic-violence', 'family-law'],
        lat: 33.4476, lng: -112.0760, isFree: true,
    },
    {
        id: 'resource-017',
        name: 'Reading Partners (National)',
        category: 'education',
        description: 'Volunteer-powered literacy program for K–5 students. Supports children in families experiencing homelessness.',
        address: 'Multiple locations', city: 'National', state: 'NA',
        phone: '(510) 631-8530', website: 'https://www.readingpartners.org',
        hours: 'School year schedule',
        tags: ['children', 'literacy', 'volunteer-tutors'],
        lat: 37.8044, lng: -122.2712, isFree: true,
    },
    {
        id: 'resource-018',
        name: 'GLIDE Memorial Church Services',
        category: 'food',
        description: 'Free daily meals (breakfast & lunch), showers, and social services. Racial justice and LGBTQ+-affirming community.',
        address: '330 Ellis St', city: 'San Francisco', state: 'CA',
        phone: '(415) 674-6090', website: 'https://www.glide.org',
        hours: 'Daily meals 7:30am & 12pm',
        tags: ['daily-meals', 'showers', 'lgbtq-affirming', 'racial-justice'],
        lat: 37.7830, lng: -122.4122, isFree: true,
    },
    {
        id: 'resource-019',
        name: 'RAINN (National)',
        category: 'mental-health',
        description: 'Nation\'s largest anti-sexual-violence organization. Online hotline and referral network for survivors.',
        address: 'National', city: 'National', state: 'NA',
        phone: '1-800-656-4673', website: 'https://www.rainn.org',
        hours: '24/7',
        tags: ['sexual-assault', 'crisis', 'women', 'online-chat'],
        lat: 38.9072, lng: -77.0369, isFree: true,
    },
    {
        id: 'resource-020',
        name: 'Compass Working Capital',
        category: 'employment',
        description: 'Financial coaching and asset-building programs for low-income families to build long-term economic security.',
        address: '105 Chauncy St', city: 'Boston', state: 'MA',
        phone: '(617) 370-9960', website: 'https://www.compassworkingcapital.org',
        hours: 'Mon–Fri 9am–5pm',
        tags: ['financial-literacy', 'women', 'family', 'savings'],
        lat: 42.3551, lng: -71.0598, isFree: true,
    },
];
// ─── Crisis Alerts ────────────────────────────────────────────────────────────
const alerts = [
    {
        id: 'alert-001',
        type: 'resource',
        title: 'Mobile Health Clinic – South Side Chicago',
        description: 'Free health screenings, vaccines, and mental health consultations available. No ID or insurance required.',
        city: 'Chicago',
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        severity: 'low',
    },
    {
        id: 'alert-002',
        type: 'weather',
        title: 'Extreme Heat Warning – Houston Metro',
        description: 'Heat index expected to reach 108°F. Cooling centres open 24/7 at public libraries and community centres. Bring water.',
        city: 'Houston',
        expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        severity: 'high',
    },
    {
        id: 'alert-003',
        type: 'safety',
        title: 'Shelter Capacity Alert – NYC Midtown',
        description: 'Several Midtown shelters at full capacity. Women\'s shelters in Harlem have availability. Call 311 for placement assistance.',
        city: 'New York',
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        severity: 'medium',
    },
    {
        id: 'alert-004',
        type: 'resource',
        title: 'Free Legal Clinic – Immigrant Rights, LA',
        description: 'DACA renewals, asylum consultations, and deportation defense. Walk-in, no appointment needed. Spanish/Tagalog interpreters on-site.',
        city: 'Los Angeles',
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        severity: 'low',
    },
    {
        id: 'alert-005',
        type: 'emergency',
        title: 'Domestic Violence Safety Alert – Atlanta',
        description: 'Increased reports of DV incidents in Westside area. Victims seeking immediate help can call 404-800-0000 for discreet pickup.',
        city: 'Atlanta',
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        severity: 'critical',
    },
    {
        id: 'alert-006',
        type: 'resource',
        title: 'LGBTQ+ Youth Pop-Up Support Night – SF',
        description: 'Free dinner, mental health check-ins, and housing nav support for LGBTQ+ youth 18–24. Tonight 6–10pm, Tenderloin.',
        city: 'San Francisco',
        expiresAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // expired
        severity: 'low',
    },
];
const legalFlows = [
    {
        id: 'legal-001',
        issue: 'lost-id',
        city: 'National',
        title: 'I lost my ID',
        steps: [
            'Visit the nearest legal aid clinic or homeless services intake office.',
            'Request replacement birth certificate support and fee-waiver forms.',
            'Use shelter intake letter plus case-worker affidavit as interim proof.',
            'Apply for replacement state ID at DMV using waiver documentation.',
        ],
        resources: [
            { name: 'Legal Aid Society', type: 'legal-aid' },
            { name: 'DMV fee waiver desk', type: 'government' },
            { name: 'Shelter case management', type: 'case-management' },
        ],
    },
    {
        id: 'legal-002',
        issue: 'eviction',
        city: 'National',
        title: 'I received an eviction notice',
        steps: [
            'Take a photo of your notice and save copies.',
            'Contact legal aid within 24 hours to file a response.',
            'Ask shelter intake for emergency placement if lockout risk exists.',
            'Request rental assistance screening and mediation support.',
        ],
        resources: [
            { name: 'Tenant Rights Clinic', type: 'legal-aid' },
            { name: 'Emergency Rental Assistance', type: 'financial-aid' },
        ],
    },
];
// ─── Seed DB ──────────────────────────────────────────────────────────────────
function seed() {
    const insertShelter = db.prepare(`
    INSERT OR REPLACE INTO shelters
      (id, name, address, city, state, lat, lng, phone, website, tags,
       capacity, current_occupancy, rating, review_count, services, hours, description)
    VALUES
      (@id, @name, @address, @city, @state, @lat, @lng, @phone, @website, @tags,
       @capacity, @currentOccupancy, @rating, @reviewCount, @services, @hours, @description)
  `);
    const insertResource = db.prepare(`
    INSERT OR REPLACE INTO resources
      (id, name, category, description, address, city, state, phone, website, hours, tags, lat, lng, is_free)
    VALUES
      (@id, @name, @category, @description, @address, @city, @state, @phone, @website, @hours, @tags, @lat, @lng, @isFree)
  `);
    const insertAlert = db.prepare(`
    INSERT OR REPLACE INTO crisis_alerts
      (id, type, title, description, city, expires_at, severity)
    VALUES
      (@id, @type, @title, @description, @city, @expiresAt, @severity)
  `);
    const insertLegalFlow = db.prepare(`
    INSERT OR REPLACE INTO legal_help_flows
      (id, issue, city, title, steps, resources)
    VALUES
      (@id, @issue, @city, @title, @steps, @resources)
  `);
    const updateShelterLiveMeta = db.prepare(`
    UPDATE shelters
    SET last_bed_update_at = ?, women_safety_score = ?, lgbtq_safety_score = ?, anti_racism_score = ?
    WHERE id = ?
  `);
    const updateResourceLiveMeta = db.prepare(`
    UPDATE resources
    SET live_status = ?, status_updated_at = ?, closes_at = ?, essentials = ?
    WHERE id = ?
  `);
    const insertPopup = db.prepare(`
    INSERT OR REPLACE INTO outreach_popups
      (id, title, type, city, address, lat, lng, starts_at, ends_at, services, verified_by)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    const insertOutreachUser = db.prepare(`
    INSERT OR REPLACE INTO outreach_users (id, email, password_hash, role, name)
    VALUES (?, ?, ?, ?, ?)
  `);
    const seedAll = () => {
        db.exec('BEGIN');
        try {
            for (const s of shelters) {
                insertShelter.run({
                    ...s,
                    website: s.website ?? null,
                    tags: JSON.stringify(s.tags),
                    services: JSON.stringify(s.services),
                    currentOccupancy: s.currentOccupancy,
                    reviewCount: s.reviewCount,
                });
            }
            for (const r of resources) {
                insertResource.run({
                    ...r,
                    website: r.website ?? null,
                    tags: JSON.stringify(r.tags),
                    isFree: r.isFree ? 1 : 0,
                });
            }
            for (const a of alerts) {
                insertAlert.run(a);
            }
            for (const flow of legalFlows) {
                insertLegalFlow.run({
                    ...flow,
                    steps: JSON.stringify(flow.steps),
                    resources: JSON.stringify(flow.resources),
                });
            }
            for (const s of shelters) {
                updateShelterLiveMeta.run(new Date(Date.now() - ((s.id.charCodeAt(s.id.length - 1) % 30) + 2) * 60 * 1000).toISOString(), 4 + ((s.id.charCodeAt(0) % 10) / 20), 4 + ((s.id.charCodeAt(1) % 10) / 20), 4 + ((s.id.charCodeAt(2) % 10) / 20), s.id);
            }
            for (const r of resources) {
                const essentials = {
                    food: r.category === 'food',
                    shower: /showers|hygiene/i.test(r.description),
                    restroom: true,
                    charging: /drop-in|clinic|center|centre|services/i.test(r.description),
                    laundry: /family|women|shelter/i.test(r.description),
                };
                const status = r.isFree ? 'open' : 'limited';
                const closesAt = new Date(Date.now() + ((r.id.charCodeAt(r.id.length - 1) % 6) + 1) * 60 * 60 * 1000).toISOString();
                updateResourceLiveMeta.run(status, new Date(Date.now() - ((r.id.charCodeAt(0) % 40) + 3) * 60 * 1000).toISOString(), closesAt, JSON.stringify(essentials), r.id);
            }
            insertPopup.run('popup-001', 'Mobile Aid Van – Downtown', 'food-van', 'New York', '125 W 31st St', 40.7496, -73.9925, new Date(Date.now() - 30 * 60 * 1000).toISOString(), new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), JSON.stringify(['Hot meals', 'Phone charging', 'Blankets']), 'verified-volunteer');
            insertOutreachUser.run('outreach-admin-001', 'outreach@saferoots.org', hashPassword('ChangeMe123!'), 'admin', 'SafeRoots Outreach Admin');
            db.exec('COMMIT');
        }
        catch (err) {
            db.exec('ROLLBACK');
            throw err;
        }
    };
    seedAll();
    console.log(`✓ Seeded ${shelters.length} shelters, ${resources.length} resources, ${alerts.length} alerts, ${legalFlows.length} legal flows, and outreach admin user (outreach@saferoots.org / ChangeMe123!).`);
}
seed();
