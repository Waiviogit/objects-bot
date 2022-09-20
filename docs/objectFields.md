# Object fields

## Add field general  payload:
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
## Options field:
```
    const optionsBody = JSON.stringify({
        category: "string",  // required
        value: "string",  // required
        position: "number",
        image: "string",
    })
   "field": {
        "name": "options" ,
        "body": optionsBody,
        "locale": "string"
    },
```
## Age Range field:
```
   "field": {
        "name": "ageRange" ,
        "body": "3 +",
        "locale": "string"
    },
```
## Publication Date field:
```
   "field": {
        "name": "publicationDate" ,
        "body": "2002, New York",
        "locale": "string"
    },
```
## Language field:
```
   "field": {
        "name": "language" ,
        "body": "en",
        "locale": "string"
    },
```
## Group Id field:
```
   "field": {
        "name": "groupId" ,
        "body": "wT94hTTDydmUz4nCiuzspGSiuRD6k",
        "locale": "string"
    },
```
## Product Id field:
```
    const productIdBody = JSON.stringify({
        productId: "string",  // required,  
        productIdType: "string",  // required,  
        productIdImage: "string",  // new Url() check
    })
   "field": {
        "name": "productId" ,
        "body": productIdBody,
        "locale": "string"
    },
```
## Company Id field:
```
    const companyIdBody = JSON.stringify({
        companyId: "string",  // required,  
        companyIdType: "string",
    })
   "field": {
        "name": "companyId" ,
        "body": productIdBody,
        "locale": "string"
    },
```
## Weight field:
```
    const weightBody = JSON.stringify({
        value: "number",  // required,  min 0
        unit: "string",  // required, enum:  t, kg, gm , mg, mcg, st, lb, oz
    })
   "field": {
        "name": "weight" ,
        "body": weightBody,
        "locale": "string"
    },
```
## Dimensions field:
```
    const dimensionsBody = JSON.stringify({
        length: "number",  // required,  min 0
        width: "number",  // required,  min 0
        depth: "number",  // required,  min 0
        unit: "string",  // required, enum: km, m, cm, mm, μm, mi, yd, ft, in, nmi,
    })
   "field": {
        "name": "dimensions" ,
        "body": dimensionsBody,
        "locale": "string"
    },
```
## Authors field:
```
    const authorsBody = JSON.stringify({
        name: "string",  // required
        authorPermlink: "string",
    })
   "field": {
        "name": "authors" ,
        "body": authorsBody,
        "locale": "string"
    },
```
## Publisher field:
```
    const publisherBody = JSON.stringify({
        name: "string",  // required
        authorPermlink: "string",
    })
   "field": {
        "name": "publisher" ,
        "body": publisherBody,
        "locale": "string"
    },
```
## Print length field:
```
   "field": {
        "name": "printLength" ,
        "body": "234", //string -number
        "locale": "string"
    },
```