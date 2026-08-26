import { groq } from "next-sanity";

// @sanity-typegen-ignore
export const activityScheduleQuery = groq`
  _type == "activitySchedule" => {
    heading,
    description,
    camperNames,
    "activityCount": count(*[_type == "activity"]),
    "featuredActivities": array::compact(featuredActivities[]{
      _key,
      ...(@->{
        _id,
        title
      })
    })
  }
`;
