import { defineQuery } from "next-sanity";
import { imageQuery } from "./shared/image";

export const SETTINGS_QUERY = defineQuery(`
  *[_type == "settings" && _id == "settings"][0]{
    _id,
    _type,
    siteName,
    logo{
      light{
        ${imageQuery}
      },
      dark{
        ${imageQuery}
      }
    },
    contact{
      email,
      phone,
      addressLines
    },
    socialLinks[]{
      _key,
      label,
      url
    }
  }
`);
