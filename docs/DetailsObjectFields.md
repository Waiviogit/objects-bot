# What is object?
An **object** on Waivio is a user-created entity such as a restaurant, hashtag, business, product, etc.,  which is given a unique URL (permlink) on the Hive blockchain. It serves as a specific reference point that can be linked to posts and contributes to the structured accumulation of knowledge within the Waivio and Hive ecosystem.

# How it works?
Simplified concept: The object type is a post, and each first-level comment under it is an object. Second-level comments and beyond are its updates. Users add updates through our bots and vote for them; updates with the most votes win.


# Object types
Object types that you might be interested in include: product, book, business, restaurant, list, and page. 

Each of these types has a list of fields, which is the information that can be added to each object.

## List of fields that the user can add for each object type

|Object type|Fields |
|---|---|
|product|status, avatar, authority, name, title, background, parent, tagCategory, categoryItem, galleryAlbum, galleryItem, sortCustom, rating, price, description, website, productId, dimensions, productWeight, groupId, options, departments, merchant, manufacturer, brand, features, pin, remove, menuItem, related, addOn, similar, delegation|
|business|status, avatar, authority, name, title, background, parent, tagCategory, categoryItem, galleryAlbum, galleryItem, sortCustom, rating, price, description, workTime, address, map, website, phone, email, link, companyId, pin, remove, menuItem, walletAddress, delegation|
|restaurant|status, avatar, authority, name, title, background, parent, tagCategory, categoryItem, galleryAlbum, galleryItem, sortCustom, rating, price, description, workTime, address, map, website, phone, email, link, companyId, pin, remove, menuItem, walletAddress, delegation| 
|list|status, avatar, authority, name, title, background, parent, tagCategory, categoryItem, galleryAlbum, galleryItem, website, description, listItem, sortCustom, pin, remove, delegation|
|page|status, avatar, authority, name, title, background, parent, tagCategory, categoryItem, galleryAlbum, galleryItem, pageContent, website, description, pin, remove, delegation|

(Details for each field are provided below.)




# Add field general payload
Request – /objects-bot/append-object

### Template:
```
{
    "author": "string",
    "permlink": "string",
    "parentAuthor": "string",
    "parentPermlink": "string",
    "body": "string",
    "title": "string",
    "field": {
        "name": "string",
        "body": "string",
        "locale": "string"
    }
}
```

### Details:

|Field Name|Example Value (in JSON)|Description|
|--|--|---|
|`author`|`"author": "wiv01"`|Comment author, user who adds the update field. <br><br>Field type: string.|
|`parentAuthor`|`"parentAuthor": "fgh87"`|The name of the bot that created the object (author of the comment that created the object) to which the update will be added. <br><br>Field type: string.|
|`parentPermlink`|`"parentPermlink": "lqd-test-rest-id04071600"`| The unique permalink of the object where users want to add related updates. It's the specific object permlink to which the update field will be appended (from author_permlink field for object).  <br>Example: A user wants to add an updated-field to "test1" object (https://example.com/test1). In this case, "parentPermlink" would be "test1".<br><br><br>Field type: string.|
|`body`|`"body": "@wiv01 added parent (English):\n vuf-test-rest-v6"`|Custom text containing update information. <br>Template: @{username} added {field} ({locale}): {details}. <br>Example: @wiv01 added description (English):/n test <br><br>Field type: string.|
|`title`|`"title": ""`|This should be empty because comments do not require a title.<br><br>Field type: string.|
|`permlink`|`"permlink": "wiv01-5bu8lnlxelw"`|Random string following the rules for generating permalinks (without special characters, etc.). <br><br>Field type: string.|
|`field`|`"field": {`<br>`"name": "parent",` <br>`"body": "vuf-test-rest-v6",` <br> `"locale": "en-US"` <br>`}`|Information about specific update-field. <br><br>Field type: object: <br> `name` - name of the field. Field type: string; <br>`body` - value of the field. Field type: string; <br>`locale` - locale of the field using locale identifier (en-US etc.). Field type: string.|



### Example:
```
{
    "author": "wiv01",
    "parentAuthor": "fgh87",
    "parentPermlink": "lqd-test-rest-id04071600",
    "body": "@wiv01 added parent (English):\n vuf-test-rest-v6",
    "title": "",
    "field": {
        "name": "parent",
        "body": "vuf-test-rest-v6",
        "locale": "en-US"
    },
    "permlink": "wiv01-5bu8lnlxelw",
}
```


***


# Field detailed information
Now, when you know main details about how to make request to add updates-field, know you can read about each specif field in details.


## address
Field for adding an address.
`body` - includes information from all fields: address, street, city, state, postalCode, country.

```
"field": {
  "name": "address",
  "body": "{\"address\":\"testFullAddress\",\"street\":\"testStreet\",\"city\":\"testCity\",\"state\":\"testState\",\"postalCode\":\"testPostalCode1111\",\"country\":\"testCountry\"}",
  "locale": "en-US"
}
```




## addon
The add-on field is for including additional objects that users might find interesting, providing a way to connect one object with another.
`body` - object permlink of the object that will be added.

```
"field": {
  "name": "addOn",
  "body": "hfa-test-product-14031521",
  "locale": "en-US"
}
```


## authority
The authority field is claims rights for the object from user. Has two options: administrative, ownership.

The meaning of this function is that the site owner in the Administrators section can then add users whom he trusts and they automatically have admin rights to the objects they claim.
For example, a manufacturer posted descriptions of its products on the Hive blockchain and indicated itself as the Ownership authority for these objects. And if the site owner adds this user as a trusted authority, then all his products will automatically appear on the site. And when a trusted authority adds, removes or edits objects, these changes are immediately displayed on the site.

- Administrative means that the fields can be changed by other users, but if the authority account voted Approve or Reject, then this is the final vote.

- Ownership means that only fields that are Approved will be taken into account when composing the object, and all that are not directly approved will be skipped.


`body` - has two options: administrative, ownership.

```
"field": {
    "name": "authority",
    "body": "ownership",
    "locale": "en-US"
}
```



## avatar
The field to add the avatar for the object.

`body` - the image link.

`id` - ID of album.

```
"field": {
  "name": "avatar",
  "body": "https://waivio.nyc3.digitaloceanspaces.com/666b0f5e8112c9786543b51f87297537657ab8425e74ff2df2736e9216e99d77",
  "locale": "en-US",
  "id": "2v5a7qlew43"
}
```


## background
The field to add the background image for the object.

`body` - the image link.


```
"field": {
  "name": "background",
  "body": "https://waivio.nyc3.digitaloceanspaces.com/23dec65bb8f56b2979a5c50be6d79cbe59ce39f3466544e0b5af46f72f282568",
  "locale": "en-US"
}
```


## brand
The field to add the brand name or object.

`body`- stringified object, which contains the following fields: "name" (an optional field) and "authorPermlink" (the object permalink that would be added as the brand, with the name taken from the object itself). Both fields type: string. 



```
const brandBody = JSON.stringify({
        "name" : string
        "authorPermlink" : string // required
})


"field": {
  "name": "brand",
  "body": "{\"name\":\"brand name\",\"authorPermlink\":\"fcs-test-brand-02021105\"}",
  "locale": "en-US"
}


```

## categoryitem
This field is used to add a tag. The tag requires a Tag category (tagCategory) where it will be added, allowing us to categorize tags. Tags are objects with a hashtag type.

`body` - the permalink of the "hashtag" object.
`id` - tag category ID.
`tagCategory` - tag category name.

```
"field": {
    "name": "categoryItem",
    "body": "testing",
    "locale": "en-US",
    "id": "62cf6c75-5ab7-4a64-9b0a-174b4122fa5c",
    "tagCategory": "Test"
}
```

### companyId
The field to add company ID. 

`body` - stringified object, which contains the following fields: "companyId" (the ID value) and "companyIdType" (the type value). Both fields type: string. 


```
const companyIdBody = JSON.stringify({
        companyId: "string",  // required,  
        companyIdType: "string",
    })

"field": {
  "name": "companyId",
  "body": "{\"companyIdType\":\"TEST\",\"companyId\":\"11111\"}",
  "locale": "en-US"
}
```

## delegation
The field to assign a user to delegate exclusive administrative rights limited to the site(s) where the user holds ownership or administrator status for a specific object.

`body` - a username.

```
"field": {
  "name": "delegation",
  "body": "new-way",
  "locale": "en-US"
}
```

## description
The field to add description.

`body` - the description value.

```
"field": {
  "name": "description",
  "body": "test description...",
  "locale": "en-US"
}
```

## dimensions
This field is used to add dimensions.

`body` - a stringified object containing the following fields: 
- "length" - required,  minimum value of 0. Field type: number.  
- "width" - required,  minimum value of 0. Field type: number.
- "depth" - required,  minimum value of 0. Field type: number. 
- "unit" - required, enumeration: km, m, cm, mm, μm, mi, yd, ft, in, nmi. Field type: string. 

```
const dimensionsBody = JSON.stringify({
        length: "number",  // required,  min 0
        width: "number",  // required,  min 0
        depth: "number",  // required,  min 0
        unit: "string",  // required, enum: km, m, cm, mm, μm, mi, yd, ft, in, nmi,
    })

"field": {
  "name": "dimensions",
  "body": "{\"length\":\"10\",\"width\":\"5\",\"depth\":\"2\",\"unit\":\"in\"}",
  "locale": "en-US"
}
```

## departments
This field is used to specify the departments to which the object belongs.

`body` - a depatment name. If the department does not exist, it will be created.

```
"field": {
  "name": "departments",
  "body": "test product",
  "locale": "en-US"
}
```



## email
This field is used to add the email.

`body` - the email value.

```
"field": {
  "name": "email",
  "body": "test@gmail.com",
  "locale": "en-US"
}
```

## features
This field is used to add features information.

`body` - a stringified object containing the following fields: "key" and "value".

```
const featuresBody = JSON.stringify({
        key: "string", 
        value: "string",
    })

"field": {
  "name": "features",
  "body": "{\"key\":\"TestName\",\"value\":\"TestValue\"}",
  "locale": "en-US"
}
```



## galleryAlbum
This field is used to add album for images.

`body` - an album name.

`id` - albume id. **(?)** random string


```
"field": {
  "name": "galleryAlbum",
  "body": "test1",
  "locale": "en-US",
  "id": "x045ap7o5to"
}
```


## galleryitem
This field is used to add an image.  The images are stored within an album.

`body` - an image URL.

`id` - ID of album.

```
"field": {
  "name": "galleryItem",
  "body": "https://waivio.nyc3.digitaloceanspaces.com/38a46fc471e30c2f12e5a6aa51ed8f32837837cc0cdbb1a653b699683759a138",
  "locale": "en-US",
  "id": "33gpml4k4tr"
}
```

## groupId
The field to add group ID.
The purpose of this field is to combine descriptions of different options of the same product into one presentation. For example, a product may have a different color, size, configuration, format, etc. In order to best describe each option, each of them can be written as an independent object with its own set of descriptions (title, description, avatar, price, gallery) and options (color, size, package, set, format, etc.). Each of these objects must reference the same Group ID. All objects with the same Group ID are combined into one universal view.


`body` - full group ID.

```
"field": {
  "name": "groupId",
  "body": "test111",
  "locale": "en-US"
}
```

## link (?)


## listItem
This field, "listItem," exists exclusively for objects of type "list." It is utilized to add items to the list.

`body` - permlink of the object that will be added to the list.

```
"field": {
  "name": "listItem",
  "body": "exh-test-list-27091703",
  "locale": "en-US"
}
```



## map
The field is used to add a map. Coordinates will include "latitude" and "longitude".

**(?)**
```
const mapBody = JSON.stringify({
        latitude: number[], 
        longitude: number[],
    })

"field": {
  "name": "map",
  "body": "{\"latitude\":\"53.435451\",\"longitude\":\"14.518846\"}",
  "locale": "en-US"
}
```


## manufacturer
The field to add the brand manufacturer or object.

`body`- stringified object, which contains the following fields: "name" (an optional field) and "authorPermlink" (the object permalink that would be added as the manufacturer, with the name taken from the object itself). Both fields type: string. 

```
const manufacturerBody = JSON.stringify({
        name: "string", 
        authorPermlink: "string",
    })

"field": {
  "name": "manufacturer",
  "body": "{\"name\":\"test name\",\"authorPermlink\":\"qpf-test-manufacturer-02021103\"}",
  "locale": "en-US"
}
```


## menuItem


{
  "name": "menuItem",
  "body": "{\"title\":\"test title\",\"style\":\"standard\",\"linkToObject\":\"mor-test-list-not-bad-advice\",\"objectType\":\"list\"}",
  "locale": "en-US"
}

merchant
name
options
pagecontent
parent
phone
pin
price
productid
productweight
rating
related
remove
restaurant
similar
sortcustom
status
tagcategory
title
walletaddress
website
worktime
