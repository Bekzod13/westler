export const ModelType = {
  Hero: 'Hero',
  Company: 'Company',
  Service: 'Service',
  Partner: 'Partner',
  /** modelId = Group.id — dynamic `field` keys per language (header/footer copy). */
  Group: 'Group',
  /** modelId = GroupItem.id — rows inside a Group (e.g. title + subtitle). */
  GroupItem: 'GroupItem',
  /** Singleton: modelId `1` — full landing copy as JSON field `payload` per language. */
  Site: 'Site',
} as const;

/** Single company row — only `Translation` rows with modelType Company and this modelId exist for “the” company. */
export const COMPANY_SINGLETON_ID = 1;

export type ModelTypeValue = (typeof ModelType)[keyof typeof ModelType];

export const TRANSLATION_FIELDS: Record<ModelTypeValue, readonly string[]> = {
  [ModelType.Hero]: ['title', 'subtitle', 'button'],
  [ModelType.Company]: ['title', 'subtitle'],
  [ModelType.Service]: ['title', 'subtitle'],
  [ModelType.Partner]: ['title'],
  /** Validated dynamically — any consistent key set across languages. */
  [ModelType.Group]: [],
  [ModelType.GroupItem]: ['title', 'subtitle'],
  [ModelType.Site]: ['payload'],
};
