const FIELDS_NAMES = {
  BODY: 'body',
  MAP: 'map',
  TAG_CATEGORY: 'tagCategory',
  CATEGORY_ITEM: 'categoryItem',
  AUTHORITY: 'authority',
  STATUS: 'status',
  NEWS_FILTER: 'newsFilter',
  RATING: 'rating',
  TAG_CLOUD: 'tagCloud',
  TITLE: 'title',
  DESCRIPTION: 'description',
  NAME: 'name',
  PARENT: 'parent',
  GALLERY_ALBUM: 'galleryAlbum',
  GALLERY_ITEM: 'galleryItem',
  AVATAR: 'avatar',
  WEBSITE: 'website',
  BACKGROUND: 'background',
  ADDRESS: 'address',
  LINK: 'link',
  TAG: 'tag',
  PHONE: 'phone',
  EMAIL: 'email',
  PRICE: 'price',
  BUTTON: 'button',
  WORK_TIME: 'workTime',
  CHART_ID: 'chartid',
  PAGE_CONTENT: 'pageContent',
  LIST_ITEM: 'listItem',
  MENU_ITEM: 'menuItem',
  SORT_CUSTOM: 'sortCustom',
  BLOG: 'blog',
  FORM: 'form',
  COMPANY_ID: 'companyId',
  PRODUCT_ID: 'productId',
  GROUP_ID: 'groupId',
  OPTIONS: 'options',
  AGE_RANGE: 'ageRange',
  PUBLICATION_DATE: 'publicationDate',
  LANGUAGE: 'language',
  WEIGHT: 'productWeight',
  DIMENSIONS: 'dimensions',
  AUTHORS: 'authors',
  PUBLISHER: 'publisher',
  PRINT_LENGTH: 'printLength',
  WIDGET: 'widget',
  NEWS_FEED: 'newsFeed',
  DEPARTMENTS: 'departments',
  MERCHANT: 'merchant',
  MANUFACTURER: 'manufacturer',
  BRAND: 'brand',
  FEATURES: 'features',
  PIN: 'pin',
  REMOVE: 'remove',
  SHOP_FILTER: 'shopFilter',
  RELATED: 'related',
  ADD_ON: 'addOn',
  SIMILAR: 'similar',
  AFFILIATE_BUTTON: 'affiliateButton',
  AFFILIATE_PRODUCT_ID_TYPES: 'affiliateProductIdTypes',
  AFFILIATE_GEO_AREA: 'affiliateGeoArea',
  AFFILIATE_URL_TEMPLATE: 'affiliateUrlTemplate',
  AFFILIATE_CODE: 'affiliateCode',
  WEB_PAGE: 'webpage',
  MAP_RECTANGLES: 'mapRectangles',
  MAP_OBJECT_TYPES: 'mapObjectTypes',
  MAP_OBJECT_TAGS: 'mapObjectTags',
  MAP_MOBILE_VIEW: 'mapMobileView',
  MAP_DESKTOP_VIEW: 'mapDesktopView',
  MAP_OBJECTS_LIST: 'mapObjectsList',
  WALLET_ADDRESS: 'walletAddress',
  ADMIN_ASSIGNED: 'adminAssigned',
};

const ARRAY_FIELDS = [
  FIELDS_NAMES.CATEGORY_ITEM,
  FIELDS_NAMES.LIST_ITEM,
  FIELDS_NAMES.TAG_CATEGORY,
  FIELDS_NAMES.GALLERY_ITEM,
  FIELDS_NAMES.GALLERY_ALBUM,
  FIELDS_NAMES.RATING,
  FIELDS_NAMES.BUTTON,
  FIELDS_NAMES.PHONE,
  FIELDS_NAMES.BLOG,
  FIELDS_NAMES.FORM,
  FIELDS_NAMES.NEWS_FILTER,
  FIELDS_NAMES.COMPANY_ID,
  FIELDS_NAMES.PRODUCT_ID,
  FIELDS_NAMES.OPTIONS,
  FIELDS_NAMES.AUTHORS,
  FIELDS_NAMES.DEPARTMENTS,
  FIELDS_NAMES.FEATURES,
  FIELDS_NAMES.GROUP_ID,
];

const MAIN_FIELDS = [
  FIELDS_NAMES.STATUS,
  FIELDS_NAMES.AVATAR,
  FIELDS_NAMES.AUTHORITY,
  FIELDS_NAMES.PIN,
  FIELDS_NAMES.REMOVE,
  FIELDS_NAMES.NAME,
  FIELDS_NAMES.TITLE,
  FIELDS_NAMES.DESCRIPTION,
  FIELDS_NAMES.BACKGROUND,
  FIELDS_NAMES.ADMIN_ASSIGNED,
];

const MAP_TYPE_FIELDS = [
  FIELDS_NAMES.MAP_RECTANGLES,
  FIELDS_NAMES.MAP_OBJECT_TYPES,
  FIELDS_NAMES.MAP_OBJECT_TAGS,
  FIELDS_NAMES.MAP_MOBILE_VIEW,
  FIELDS_NAMES.MAP_DESKTOP_VIEW,
  FIELDS_NAMES.MAP_OBJECTS_LIST,
];

const CONTACT_FIELDS = [
  FIELDS_NAMES.WORK_TIME,
  FIELDS_NAMES.ADDRESS,
  FIELDS_NAMES.MAP,
  FIELDS_NAMES.WEBSITE,
  FIELDS_NAMES.PHONE,
  FIELDS_NAMES.EMAIL,
  FIELDS_NAMES.LINK,
];

const MENU_FIELDS_LEGACY = [
  FIELDS_NAMES.LIST_ITEM,
  FIELDS_NAMES.MENU_ITEM,
  FIELDS_NAMES.BUTTON,
  FIELDS_NAMES.BLOG,
  FIELDS_NAMES.FORM,
  FIELDS_NAMES.SORT_CUSTOM,
];

const COMMON_FIELDS = [
  ...MAIN_FIELDS,
  ...MENU_FIELDS_LEGACY,
  FIELDS_NAMES.PARENT,
  FIELDS_NAMES.TAG_CATEGORY,
  FIELDS_NAMES.CATEGORY_ITEM,
  FIELDS_NAMES.GALLERY_ALBUM,
  FIELDS_NAMES.GALLERY_ITEM,
  FIELDS_NAMES.RATING,
  FIELDS_NAMES.PRICE,
  FIELDS_NAMES.NEWS_FILTER,
  FIELDS_NAMES.WEBSITE,
];

const COMMON_FIELDS_AND_CONTACTS = [
  ...COMMON_FIELDS,
  ...CONTACT_FIELDS,
];

const EXPOSED_FIELDS_FOR_OBJECT_TYPE = {
  hashtag: MAIN_FIELDS,
  commodity: COMMON_FIELDS_AND_CONTACTS,
  currency: COMMON_FIELDS_AND_CONTACTS,
  stocks: COMMON_FIELDS_AND_CONTACTS,
  indices: COMMON_FIELDS_AND_CONTACTS,
  app: [
    ...COMMON_FIELDS_AND_CONTACTS,
    FIELDS_NAMES.WALLET_ADDRESS,
  ],
  car: COMMON_FIELDS_AND_CONTACTS,
  test: COMMON_FIELDS_AND_CONTACTS,
  person: [
    ...COMMON_FIELDS_AND_CONTACTS,
    FIELDS_NAMES.WALLET_ADDRESS,
  ],
  currencies: COMMON_FIELDS_AND_CONTACTS,
  crypto: [
    ...MAIN_FIELDS,
    ...MENU_FIELDS_LEGACY,
    FIELDS_NAMES.PARENT,
    FIELDS_NAMES.TAG_CATEGORY,
    FIELDS_NAMES.CATEGORY_ITEM,
    FIELDS_NAMES.GALLERY_ALBUM,
    FIELDS_NAMES.GALLERY_ITEM,
    FIELDS_NAMES.NEWS_FILTER,
    FIELDS_NAMES.WEBSITE,
    FIELDS_NAMES.LINK,
    FIELDS_NAMES.CHART_ID,
  ],
  list: [
    ...MAIN_FIELDS,
    FIELDS_NAMES.PARENT,
    FIELDS_NAMES.TAG_CATEGORY,
    FIELDS_NAMES.CATEGORY_ITEM,
    FIELDS_NAMES.GALLERY_ALBUM,
    FIELDS_NAMES.GALLERY_ITEM,
    FIELDS_NAMES.LIST_ITEM,
    FIELDS_NAMES.SORT_CUSTOM,
  ],
  product: [
    ...COMMON_FIELDS,
    FIELDS_NAMES.PRODUCT_ID,
    FIELDS_NAMES.GROUP_ID,
    FIELDS_NAMES.WEIGHT,
    FIELDS_NAMES.DIMENSIONS,
    FIELDS_NAMES.OPTIONS,
    FIELDS_NAMES.DEPARTMENTS,
    FIELDS_NAMES.MERCHANT,
    FIELDS_NAMES.MANUFACTURER,
    FIELDS_NAMES.BRAND,
    FIELDS_NAMES.FEATURES,
    FIELDS_NAMES.RELATED,
    FIELDS_NAMES.ADD_ON,
    FIELDS_NAMES.SIMILAR,
  ],
  drink: [
    ...MAIN_FIELDS,
    FIELDS_NAMES.PARENT,
    FIELDS_NAMES.TAG_CATEGORY,
    FIELDS_NAMES.CATEGORY_ITEM,
    FIELDS_NAMES.GALLERY_ALBUM,
    FIELDS_NAMES.GALLERY_ITEM,
    FIELDS_NAMES.RATING,
    FIELDS_NAMES.PRICE,
  ],
  place: [
    ...COMMON_FIELDS_AND_CONTACTS,
    FIELDS_NAMES.COMPANY_ID,
    FIELDS_NAMES.WALLET_ADDRESS,
  ],
  business: [
    ...COMMON_FIELDS_AND_CONTACTS,
    FIELDS_NAMES.COMPANY_ID,
    FIELDS_NAMES.WALLET_ADDRESS,
  ],
  page: [
    ...MAIN_FIELDS,
    FIELDS_NAMES.PARENT,
    FIELDS_NAMES.GALLERY_ALBUM,
    FIELDS_NAMES.GALLERY_ITEM,
    FIELDS_NAMES.TAG_CATEGORY,
    FIELDS_NAMES.CATEGORY_ITEM,
    FIELDS_NAMES.PAGE_CONTENT,
    FIELDS_NAMES.WEBSITE,
  ],
  service: [
    ...COMMON_FIELDS,
    FIELDS_NAMES.PRODUCT_ID,
    FIELDS_NAMES.GROUP_ID,
    FIELDS_NAMES.OPTIONS,
    FIELDS_NAMES.DEPARTMENTS,
    FIELDS_NAMES.RELATED,
    FIELDS_NAMES.ADD_ON,
    FIELDS_NAMES.SIMILAR,
    FIELDS_NAMES.EMAIL,
    FIELDS_NAMES.PHONE,
    FIELDS_NAMES.LINK,
  ],
  company: [
    ...COMMON_FIELDS_AND_CONTACTS,
    FIELDS_NAMES.COMPANY_ID,
    FIELDS_NAMES.WALLET_ADDRESS,
  ],
  organization: [
    ...COMMON_FIELDS_AND_CONTACTS,
    FIELDS_NAMES.COMPANY_ID,
    FIELDS_NAMES.WALLET_ADDRESS,
  ],
  hotel: [
    ...COMMON_FIELDS_AND_CONTACTS,
    FIELDS_NAMES.COMPANY_ID,
  ],
  motel: [
    ...COMMON_FIELDS_AND_CONTACTS,
    FIELDS_NAMES.COMPANY_ID,
  ],
  resort: [
    ...COMMON_FIELDS_AND_CONTACTS,
    FIELDS_NAMES.COMPANY_ID,
  ],
  'b&b': [
    ...COMMON_FIELDS_AND_CONTACTS,
    FIELDS_NAMES.COMPANY_ID,
  ],
  restaurant: [
    ...COMMON_FIELDS_AND_CONTACTS,
    FIELDS_NAMES.COMPANY_ID,
    FIELDS_NAMES.WALLET_ADDRESS,
  ],
  dish: [
    ...MAIN_FIELDS,
    FIELDS_NAMES.PARENT,
    FIELDS_NAMES.GALLERY_ALBUM,
    FIELDS_NAMES.GALLERY_ITEM,
    FIELDS_NAMES.TAG_CATEGORY,
    FIELDS_NAMES.CATEGORY_ITEM,
    FIELDS_NAMES.RATING,
    FIELDS_NAMES.PRICE,
  ],
  cryptopairs: [
    ...MAIN_FIELDS,
    FIELDS_NAMES.CHART_ID,
  ],
  book: [
    ...COMMON_FIELDS,
    FIELDS_NAMES.PRODUCT_ID,
    FIELDS_NAMES.GROUP_ID,
    FIELDS_NAMES.WEIGHT,
    FIELDS_NAMES.DEPARTMENTS,
    FIELDS_NAMES.DIMENSIONS,
    FIELDS_NAMES.AUTHORS,
    FIELDS_NAMES.PUBLISHER,
    FIELDS_NAMES.PRINT_LENGTH,
    FIELDS_NAMES.RELATED,
    FIELDS_NAMES.ADD_ON,
    FIELDS_NAMES.SIMILAR,
    FIELDS_NAMES.LANGUAGE,
    FIELDS_NAMES.PUBLICATION_DATE,
    FIELDS_NAMES.AGE_RANGE,
    FIELDS_NAMES.OPTIONS,
  ],
  widget: [
    ...MAIN_FIELDS,
    FIELDS_NAMES.PARENT,
    FIELDS_NAMES.WIDGET,
    FIELDS_NAMES.GALLERY_ALBUM,
    FIELDS_NAMES.GALLERY_ITEM,
    FIELDS_NAMES.TAG_CATEGORY,
    FIELDS_NAMES.CATEGORY_ITEM,
    FIELDS_NAMES.WEBSITE,
  ],
  newsfeed: [
    ...MAIN_FIELDS,
    FIELDS_NAMES.PARENT,
    FIELDS_NAMES.NEWS_FEED,
    FIELDS_NAMES.GALLERY_ALBUM,
    FIELDS_NAMES.GALLERY_ITEM,
    FIELDS_NAMES.TAG_CATEGORY,
    FIELDS_NAMES.CATEGORY_ITEM,
    FIELDS_NAMES.WEBSITE,
  ],
  shop: [
    ...MAIN_FIELDS,
    FIELDS_NAMES.PARENT,
    FIELDS_NAMES.GALLERY_ALBUM,
    FIELDS_NAMES.GALLERY_ITEM,
    FIELDS_NAMES.WEBSITE,
    FIELDS_NAMES.SHOP_FILTER,
  ],
  affiliate: [
    ...MAIN_FIELDS,
    FIELDS_NAMES.PARENT,
    FIELDS_NAMES.GALLERY_ALBUM,
    FIELDS_NAMES.GALLERY_ITEM,
    FIELDS_NAMES.TAG_CATEGORY,
    FIELDS_NAMES.CATEGORY_ITEM,
    FIELDS_NAMES.RATING,
    FIELDS_NAMES.AFFILIATE_CODE,
    FIELDS_NAMES.AFFILIATE_BUTTON,
    FIELDS_NAMES.AFFILIATE_URL_TEMPLATE,
    FIELDS_NAMES.AFFILIATE_GEO_AREA,
    FIELDS_NAMES.AFFILIATE_PRODUCT_ID_TYPES,
  ],
  webpage: [
    ...MAIN_FIELDS,
    FIELDS_NAMES.WEB_PAGE,
    FIELDS_NAMES.PARENT,
    FIELDS_NAMES.GALLERY_ALBUM,
    FIELDS_NAMES.GALLERY_ITEM,
    FIELDS_NAMES.TAG_CATEGORY,
    FIELDS_NAMES.CATEGORY_ITEM,
  ],
  map: [
    ...MAIN_FIELDS,
    ...MAP_TYPE_FIELDS,
    FIELDS_NAMES.GALLERY_ALBUM,
    FIELDS_NAMES.GALLERY_ITEM,
    FIELDS_NAMES.TAG_CATEGORY,
    FIELDS_NAMES.CATEGORY_ITEM,
    FIELDS_NAMES.WEBSITE,
  ],
};

module.exports = {
  ARRAY_FIELDS,
  FIELDS_NAMES,
  EXPOSED_FIELDS_FOR_OBJECT_TYPE,
};
