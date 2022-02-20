export interface ContestData {
  place: number
  ctftimeId?: number
  name: string
  ctfPoints: number
  ctftimeRating?: number
  writeupTag?: string
  year: number
}

const contestsData: ContestData[] = [
  {
    place: 1,
    name: 'MOCSCTF 2022',
    ctfPoints: 3390,
    year: 2022,
  },
  {
    place: 36,
    ctftimeId: 1550,
    name: 'Hayyim CTF 2022',
    ctfPoints: 851.99,
    ctftimeRating: 3.72,
    year: 2022,
  },
  {
    place: 70,
    ctftimeId: 1553,
    name: 'Hayyim CTF 2022',
    ctfPoints: 100,
    ctftimeRating: NaN,
    year: 2022,
  },
  {
    place: 9,
    ctftimeId: 1560,
    name: 'DefCamp CTF 21-22 Online',
    ctfPoints: 3838,
    ctftimeRating: 36.967,
    year: 2022,
  },
  {
    place: 1,
    ctftimeId: 1556,
    name: 'Cyber Grabs CTF 0x03',
    writeupTag: 'cyber-grabs-ctf-0x03',
    ctfPoints: 6550,
    ctftimeRating: 46.46,
    year: 2022,
  },
  {
    place: 73,
    ctftimeId: 1541,
    name: 'DiceCTF 2022',
    writeupTag: 'dice-ctf-2022',
    ctfPoints: 736,
    ctftimeRating: 3.205,
    year: 2022,
  },
  {
    place: 30,
    ctftimeId: 1505,
    name: "Insomni'hack teaser 2022",
    writeupTag: 'insomnihack-teaser-2022',
    ctfPoints: 529,
    ctftimeRating: 4.197,
    year: 2022,
  },
  {
    place: 83,
    ctftimeId: 1507,
    name: 'Real World CTF 4th',
    ctfPoints: 105.0,
    ctftimeRating: 1.982,
    year: 2022,
  },
  {
    place: 3,
    ctftimeId: 1545,
    name: 'KnightCTF 2022',
    ctfPoints: 5075.0,
    ctftimeRating: 21.657,
    writeupTag: 'knight-ctf-2022',
    year: 2022,
  },
  {
    place: 46,
    ctftimeId: 1533,
    name: 'Newark Academy CTF',
    ctfPoints: 1265.0,
    ctftimeRating: 6.841,
    year: 2022,
  },
  {
    place: 49,
    ctftimeId: 1540,
    name: 'TetCTF 2022',
    ctfPoints: 516.0,
    ctftimeRating: 2.307,
    year: 2022,
  },
  {
    place: 8,
    ctftimeId: 1536,
    name: 'BackdoorCTF 2021',
    ctfPoints: 1524.0,
    ctftimeRating: 12.872,
    year: 2021,
  },
  {
    place: 52,
    ctftimeId: 1447,
    name: 'hxp CTF 2021',
    ctfPoints: 397.0,
    ctftimeRating: 5.958,
    year: 2021,
  },
  {
    place: 17,
    ctftimeId: 1512,
    name: 'idekCTF 2021',
    ctfPoints: 5248.0,
    ctftimeRating: 9.089,
    year: 2021,
  },
  {
    place: 6,
    ctftimeId: 1449,
    name: 'NITECTF',
    ctfPoints: 9750.0,
    ctftimeRating: 22.229,
    year: 2021,
  },
  {
    place: 27,
    ctftimeId: 1476,
    name: 'MetaCTF CyberGames 2021',
    ctfPoints: 9450.0,
    ctftimeRating: 15.993,
    year: 2021,
  },
  {
    place: 15,
    ctftimeId: 1501,
    name: 'TFC CTF 2021',
    ctfPoints: 2823.0,
    ctftimeRating: 15.934,
    year: 2021,
  },
  {
    place: 90,
    ctftimeId: 1376,
    name: 'Balsn CTF 2021',
    ctfPoints: 50.0,
    ctftimeRating: 0.8,
    year: 2021,
  },
  {
    place: 63,
    ctftimeId: 1438,
    name: 'K3RN3LCTF',
    ctfPoints: 1416.0,
    ctftimeRating: 3.462,
    year: 2021,
  },
]

export default contestsData
