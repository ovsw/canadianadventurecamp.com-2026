import { benefitCardsQuery } from "./benefit-cards";
import { ctaBannerQuery } from "./cta-banner";
import { faqAccordionQuery } from "./faq-accordion";
import { latestArticlesQuery } from "./latest-articles";
import { richTextBlockQuery } from "./rich-text-block";
import { storyFeatureQuery } from "./story-feature";
import { teamMembersQuery } from "./team-members";
import { heroQuery } from "./hero";
import { homeHeroQuery } from "./home-hero";
import { imageCollageFeatureQuery } from "./image-collage-feature";
import { featureCardsQuery } from "./feature-cards";
import { activityScheduleQuery } from "./activity-schedule";
import { facilitiesMapSectionQuery } from "./facilities-map-section";

export const pageBuilderQuery = `
  blocks[]{
    _key,
    _type,
    ${latestArticlesQuery},
    ${faqAccordionQuery},
    ${storyFeatureQuery},
    ${teamMembersQuery},
    ${richTextBlockQuery},
    ${ctaBannerQuery},
    ${benefitCardsQuery},
    ${heroQuery},
    ${homeHeroQuery},
    ${imageCollageFeatureQuery},
    ${featureCardsQuery},
    ${activityScheduleQuery},
    ${facilitiesMapSectionQuery}
  }
`;
