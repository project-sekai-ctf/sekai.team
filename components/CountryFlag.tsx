interface Props {
  country: string
}

// Parameter: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
export default function CountryFlag({ country }: Props) {
  if (!country) return null

  return (
    <img
      src={`https://flagcdn.com/20x15/${country}.png`}
      alt={country}
      className="align-text-middle bottom m-0 inline-block"
    />
  )
}
