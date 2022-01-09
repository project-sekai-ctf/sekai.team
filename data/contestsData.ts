export interface ContestData {
  place: number
  ctftimeId: number
  name: string
  ctfPoints: number
  ctftimeRating: number
}

const contestsData: ContestData[] = [
  { place: 49, ctftimeId: 1540, name: 'TetCTF 2022', ctfPoints: 516.0, ctftimeRating: 2.307 },
  { place: 8, ctftimeId: 1536, name: 'BackdoorCTF 2021', ctfPoints: 1524.0, ctftimeRating: 12.872 },
  {
    place: 131,
    ctftimeId: 1416,
    name: 'ASIS CTF Finals 2021',
    ctfPoints: 22.0,
    ctftimeRating: 0.738,
  },
  {
    place: 534,
    ctftimeId: 1525,
    name: 'X-MAS CTF 2021 Second Weekend',
    ctfPoints: 6.0,
    ctftimeRating: 0.05,
  },
  { place: 52, ctftimeId: 1447, name: 'hxp CTF 2021', ctfPoints: 397.0, ctftimeRating: 5.958 },
  { place: 360, ctftimeId: 1458, name: 'SECCON CTF 2021', ctfPoints: 53.0, ctftimeRating: 1.042 },
  { place: 17, ctftimeId: 1512, name: 'idekCTF 2021', ctfPoints: 5248.0, ctftimeRating: 9.089 },
  { place: 6, ctftimeId: 1449, name: 'NITECTF', ctfPoints: 9750.0, ctftimeRating: 22.229 },
  { place: 262, ctftimeId: 1460, name: 'HITCON CTF 2021', ctfPoints: 92.0, ctftimeRating: 1.591 },
  {
    place: 27,
    ctftimeId: 1476,
    name: 'MetaCTF CyberGames 2021',
    ctfPoints: 9450.0,
    ctftimeRating: 15.993,
  },
  {
    place: 208,
    ctftimeId: 1515,
    name: '2021 Metasploit community CTF',
    ctfPoints: 200.0,
    ctftimeRating: 2.775,
  },
  {
    place: 113,
    ctftimeId: 1516,
    name: 'Ledger Donjon CTF 2021',
    ctfPoints: 2.0,
    ctftimeRating: 0.0,
  },
  { place: 15, ctftimeId: 1501, name: 'TFC CTF 2021', ctfPoints: 2823.0, ctftimeRating: 15.934 },
  { place: 90, ctftimeId: 1376, name: 'Balsn CTF 2021', ctfPoints: 50.0, ctftimeRating: 0.8 },
  { place: 63, ctftimeId: 1438, name: 'K3RN3LCTF', ctfPoints: 1416.0, ctftimeRating: 3.462 },
]

export default contestsData
