import { groq } from "next-sanity";

const seasonConfigFields = `
  rate,
  description,
  sessions[]{
    _key,
    startDate,
    availabilityStatus,
    availabilityNote
  }
`;

// @sanity-typegen-ignore
export const datesRatesSectionQuery = groq`
  _type == "datesRatesSection" => {
    eyebrow,
    heading,
    introduction,
    detailsLinkText,
    sessionIncludes,
    conditions,
    "activeSeason": *[_id == "seasonsConfig" && _type == "seasonsConfig"][0].activeSeason->{
      _id,
      name,
      startDate,
      twoWeek{${seasonConfigFields}},
      fourWeek{${seasonConfigFields}},
      sixWeek{${seasonConfigFields}},
      eightWeek{${seasonConfigFields}}
    }
  }
`;
