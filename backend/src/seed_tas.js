/**
 * seed_tas.js
 *
 * Seeds 50 TAs into the database via the backend API.
 * Run while the backend is running on port 3000:
 *   node backend/src/seed_tas.js
 */

const BASE_URL = 'http://localhost:3000';

// ── 50 TAs with realistic Tufts-style UTLNs ──────────────────────────
const TAS = [
  // 2 Teaching Fellows (is_tf: true, lab_perm: 2)
  { ta_id: 'mgarci01', first_name: 'Maria',    last_name: 'Garcia',     is_tf: true,  lab_perm: 2 },
  { ta_id: 'jkwon02',  first_name: 'James',    last_name: 'Kwon',      is_tf: true,  lab_perm: 2 },

  // 10 Lab Leads (lab_perm: 2)
  { ta_id: 'alee03',   first_name: 'Alice',    last_name: 'Lee',       is_tf: false, lab_perm: 2 },
  { ta_id: 'bpatel04', first_name: 'Bharat',   last_name: 'Patel',     is_tf: false, lab_perm: 2 },
  { ta_id: 'ckim05',   first_name: 'Claire',   last_name: 'Kim',       is_tf: false, lab_perm: 2 },
  { ta_id: 'dwang06',  first_name: 'David',    last_name: 'Wang',      is_tf: false, lab_perm: 2 },
  { ta_id: 'ejohns07', first_name: 'Emily',    last_name: 'Johnson',   is_tf: false, lab_perm: 2 },
  { ta_id: 'fchen08',  first_name: 'Frank',    last_name: 'Chen',      is_tf: false, lab_perm: 2 },
  { ta_id: 'gnguye09', first_name: 'Grace',    last_name: 'Nguyen',    is_tf: false, lab_perm: 2 },
  { ta_id: 'hsingh10', first_name: 'Harsh',    last_name: 'Singh',     is_tf: false, lab_perm: 2 },
  { ta_id: 'ipark11',  first_name: 'Irene',    last_name: 'Park',      is_tf: false, lab_perm: 2 },
  { ta_id: 'jzhang12', first_name: 'Jason',    last_name: 'Zhang',     is_tf: false, lab_perm: 2 },

  // 18 Lab Assistants (lab_perm: 1)
  { ta_id: 'kbrown13', first_name: 'Katie',    last_name: 'Brown',     is_tf: false, lab_perm: 1 },
  { ta_id: 'ldavis14', first_name: 'Liam',     last_name: 'Davis',     is_tf: false, lab_perm: 1 },
  { ta_id: 'mmille15', first_name: 'Maya',     last_name: 'Miller',    is_tf: false, lab_perm: 1 },
  { ta_id: 'nwilso16', first_name: 'Nathan',   last_name: 'Wilson',    is_tf: false, lab_perm: 1 },
  { ta_id: 'otaylo17', first_name: 'Olivia',   last_name: 'Taylor',    is_tf: false, lab_perm: 1 },
  { ta_id: 'pander18', first_name: 'Pablo',    last_name: 'Anderson',  is_tf: false, lab_perm: 1 },
  { ta_id: 'qthoma19', first_name: 'Quinn',    last_name: 'Thomas',    is_tf: false, lab_perm: 1 },
  { ta_id: 'rjacks20', first_name: 'Rachel',   last_name: 'Jackson',   is_tf: false, lab_perm: 1 },
  { ta_id: 'swhite21', first_name: 'Sam',      last_name: 'White',     is_tf: false, lab_perm: 1 },
  { ta_id: 'tharri22', first_name: 'Tina',     last_name: 'Harris',    is_tf: false, lab_perm: 1 },
  { ta_id: 'umarti23', first_name: 'Ulysses',  last_name: 'Martinez',  is_tf: false, lab_perm: 1 },
  { ta_id: 'vrobin24', first_name: 'Violet',   last_name: 'Robinson',  is_tf: false, lab_perm: 1 },
  { ta_id: 'wclark25', first_name: 'Will',     last_name: 'Clark',     is_tf: false, lab_perm: 1 },
  { ta_id: 'xrodri26', first_name: 'Xena',     last_name: 'Rodriguez', is_tf: false, lab_perm: 1 },
  { ta_id: 'ylewis27', first_name: 'Yusuf',    last_name: 'Lewis',     is_tf: false, lab_perm: 1 },
  { ta_id: 'zwalke28', first_name: 'Zara',     last_name: 'Walker',    is_tf: false, lab_perm: 1 },
  { ta_id: 'ahall29',  first_name: 'Aiden',    last_name: 'Hall',      is_tf: false, lab_perm: 1 },
  { ta_id: 'byoung30', first_name: 'Bianca',   last_name: 'Young',     is_tf: false, lab_perm: 1 },
  { ta_id: 'callen31', first_name: 'Carlos',   last_name: 'Allen',     is_tf: false, lab_perm: 1 },
  { ta_id: 'dking32',  first_name: 'Diana',    last_name: 'King',      is_tf: false, lab_perm: 1 },

  // 20 OH-only TAs (lab_perm: 0)
  { ta_id: 'ewrigh33', first_name: 'Ethan',    last_name: 'Wright',    is_tf: false, lab_perm: 0 },
  { ta_id: 'flopez34', first_name: 'Fiona',    last_name: 'Lopez',     is_tf: false, lab_perm: 0 },
  { ta_id: 'ghill35',  first_name: 'George',   last_name: 'Hill',      is_tf: false, lab_perm: 0 },
  { ta_id: 'hscott36', first_name: 'Hannah',   last_name: 'Scott',     is_tf: false, lab_perm: 0 },
  { ta_id: 'igreen37', first_name: 'Isaac',    last_name: 'Green',     is_tf: false, lab_perm: 0 },
  { ta_id: 'jadams38', first_name: 'Julia',    last_name: 'Adams',     is_tf: false, lab_perm: 0 },
  { ta_id: 'kbaker39', first_name: 'Kevin',    last_name: 'Baker',     is_tf: false, lab_perm: 0 },
  { ta_id: 'lnelso40', first_name: 'Luna',     last_name: 'Nelson',    is_tf: false, lab_perm: 0 },
  { ta_id: 'mcarte41', first_name: 'Marcus',   last_name: 'Carter',    is_tf: false, lab_perm: 0 },
  { ta_id: 'nmitch42', first_name: 'Nora',     last_name: 'Mitchell',  is_tf: false, lab_perm: 0 },
  { ta_id: 'operer43', first_name: 'Oscar',    last_name: 'Perez',     is_tf: false, lab_perm: 0 },
  { ta_id: 'prober44', first_name: 'Priya',    last_name: 'Roberts',   is_tf: false, lab_perm: 0 },
  { ta_id: 'qturne45', first_name: 'Quentin',  last_name: 'Turner',    is_tf: false, lab_perm: 0 },
  { ta_id: 'rphili46', first_name: 'Rosa',     last_name: 'Phillips',  is_tf: false, lab_perm: 0 },
  { ta_id: 'scampb47', first_name: 'Sanjay',   last_name: 'Campbell',  is_tf: false, lab_perm: 0 },
  { ta_id: 'tparke48', first_name: 'Talia',    last_name: 'Parker',    is_tf: false, lab_perm: 0 },
  { ta_id: 'uevan49',  first_name: 'Uma',      last_name: 'Evans',     is_tf: false, lab_perm: 0 },
  { ta_id: 'vcolli50', first_name: 'Victor',   last_name: 'Collins',   is_tf: false, lab_perm: 0 },
  { ta_id: 'wedwar51', first_name: 'Wendy',    last_name: 'Edwards',   is_tf: false, lab_perm: 0 },
  { ta_id: 'xstewa52', first_name: 'Xavier',   last_name: 'Stewart',   is_tf: false, lab_perm: 0 },
];

// ── Time slots for a 90-minute schedule from 09:00 to 00:00 ──────────
const DAYS = ['m', 'tu', 'w', 'th', 'f', 'sa', 'su'];
const SLOT_STARTS = [
  '09:00', '10:30', '12:00', '13:30', '15:00',
  '16:30', '18:00', '19:30', '21:00', '22:30',
];
const SLOT_ENDS = [
  '10:30', '12:00', '13:30', '15:00', '16:30',
  '18:00', '19:30', '21:00', '22:30', '24:00',
];

// Build the full list of all possible slots
const ALL_SLOTS = [];
for (const day of DAYS) {
  for (let i = 0; i < SLOT_STARTS.length; i++) {
    ALL_SLOTS.push({ day, start: SLOT_STARTS[i], end: SLOT_ENDS[i] });
  }
}

/**
 * Generate random preferences for a TA.
 * Returns an array of strings like "m:09:00-10:30:2"
 */
function generatePreferences(ta) {
  const prefs = [];

  // Each TA is available for 25-45 out of 70 total slots
  const numSlots = 25 + Math.floor(Math.random() * 21);

  // Shuffle a copy of ALL_SLOTS and take the first numSlots
  const shuffled = [...ALL_SLOTS].sort(() => Math.random() - 0.5);
  const selectedSlots = shuffled.slice(0, numSlots);

  for (const slot of selectedSlots) {
    // ~40% preferred (2), ~60% available (1)
    const pref = Math.random() < 0.4 ? 2 : 1;
    prefs.push(`${slot.day}:${slot.start}-${slot.end}:${pref}`);
  }

  return prefs;
}

async function apiCall(path, method, body) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Seeding ${TAS.length} TAs into the database`);
  console.log(`${'='.repeat(60)}\n`);

  let created = 0;
  let prefsSet = 0;

  for (const ta of TAS) {
    try {
      // Step 1: Create TA
      const createResult = await apiCall('/ta/create', 'POST', {
        ta_id: ta.ta_id,
        first_name: ta.first_name,
        last_name: ta.last_name,
        is_tf: ta.is_tf,
        lab_perm: ta.lab_perm,
      });
      created++;

      const existed = createResult.existed ? ' (already existed)' : '';
      console.log(`[${created}/${TAS.length}] Created ${ta.ta_id} (${ta.first_name} ${ta.last_name}) lab_perm=${ta.lab_perm} is_tf=${ta.is_tf}${existed}`);

      // Step 2: Set preferences
      const prefs = generatePreferences(ta);
      await apiCall('/ta/preferences', 'POST', {
        ta_id: ta.ta_id,
        preferences: prefs,
      });
      prefsSet++;

      const prefCount = prefs.length;
      const preferred = prefs.filter(p => p.endsWith(':2')).length;
      const available = prefs.filter(p => p.endsWith(':1')).length;
      console.log(`         Preferences: ${prefCount} slots (${preferred} preferred, ${available} available)`);

    } catch (err) {
      console.error(`  ERROR creating ${ta.ta_id}: ${err.message}`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Done! Created ${created} TAs, set preferences for ${prefsSet}`);
  console.log(`${'='.repeat(60)}\n`);

  // Summary by permission level
  const permCounts = { 0: 0, 1: 0, 2: 0 };
  const tfCount = TAS.filter(t => t.is_tf).length;
  TAS.forEach(t => permCounts[t.lab_perm]++);
  console.log(`  Distribution:`);
  console.log(`    Teaching Fellows (is_tf=true):  ${tfCount}`);
  console.log(`    Lab Leads    (lab_perm=2):      ${permCounts[2]}`);
  console.log(`    Lab Assistants (lab_perm=1):    ${permCounts[1]}`);
  console.log(`    OH Only      (lab_perm=0):      ${permCounts[0]}`);
  console.log('');
}

main().catch(console.error);
