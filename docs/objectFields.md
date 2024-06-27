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
        "body": companyIdBody,
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
## News feed field:
```
    const newsFeedBody = JSON.stringify({
          "allowList": string[][],
          "ignoreList": string[],
          "typeList": string[],
          "authors": string[]
    })
   "field": {
        "name": "newsFeed" ,
        "body": newsFeedBody,
        "locale": "string"
    },
```
## Widget field:
```
    const widgetBody = JSON.stringify({
           column: string,
           type: string,
           content: string,
    })
   "field": {
        "name": "widget" ,
        "body": widgetBody,
        "locale": "string"
    },
```
## Merchant field:
```
    const merchantBody = JSON.stringify({
        name: "string", 
        authorPermlink: "string",
    })
   "field": {
        "name": "merchant" ,
        "body": merchantBody,
        "locale": "string"
    },
```

## Manufacturer field:
```
    const manufacturerBody = JSON.stringify({
        name: "string", 
        authorPermlink: "string",
    })
   "field": {
        "name": "manufacturer" ,
        "body": manufacturerBody,
        "locale": "string"
    },
```

## Brand field:
```
    const brandBody = JSON.stringify({
        name: "string", 
        authorPermlink: "string",
    })
   "field": {
        "name": "brand" ,
        "body": brandBody,
        "locale": "string"
    },
```

## Features field:
```
    const featuresBody = JSON.stringify({
        key: "string", 
        value: "string",
    })
   "field": {
        "name": "features" ,
        "body": featuresBody,
        "locale": "string"
    },
```

## Related field:
```
   "field": {
        "name": "related" ,
        "body": "author_permlink",
        "locale": "string"
    },
```

## Add-on field:
```
   "field": {
        "name": "add-on" ,
        "body": "author_permlink",
        "locale": "string"
    },
```

## Similar field:
```
   "field": {
        "name": "similar" ,
        "body": "author_permlink",
        "locale": "string"
    },
```

## Pin field:
```
   "field": {
        "name": "pin" ,
        "body": "author/permlink",
        "locale": "string"
    },
```

## Remove field:
```
   "field": {
        "name": "remove" ,
        "body": "author/permlink",
        "locale": "string"
    },
```

## Shop Filter field:
```
    const filterBody = JSON.stringify({
        type: string, 
        departments: string[],
        tags: string[],
        authorities: string[],
    })
    
   "field": {
        "name": "shopFilter" ,
        "body": filterBody,
        "locale": "string"
    },
```


## Menu Item field:
```
    const menuItemBody = JSON.stringify({
        title: string,  //required
        style: string,  //required
        image: string, 
        linkToObject: string, // existing author_permlink
        objectType: string, // if linkToObject
        linkToWeb: string, // valid uri
    })
    // menuItemBody must have either linkToObject or linkToWeb
    
   "field": {
        "name": "menuItem" ,
        "body": menuItemBody,
        "locale": "string"
    },
```

## affiliateButton field:
```    
   "field": {
        "name": "affiliateButton" ,
        "body": affiliateButtonURI, //valid uri
        "locale": "string"
    },
```

## affiliateProductIdTypes field:
```
   // lowercase only !
    
   "field": {
        "name": "affiliateProductIdTypes" ,
        "body": "string",
        "locale": "string"
    },
```

## affiliateGeoArea field:
```  
   "field": {
        "name": "affiliateGeoArea" ,
        "body": "string",
        "locale": "string"
    },
```

## affiliateUrlTemplate field:
```
   $productId and $affiliateCode is required inside the string
    
   "field": {
        "name": "affiliateUrlTemplate" ,
        "body": "https://amazon.com/dp/$productId/ref=?$affiliateCode",
        "locale": "string"
    },
```

## affiliateCode field:
```
   const affiliateCodeBody = JSON.stringify(["PERSONAL", "ACCHSUIT"])
   
   //where first argument is string with either PERSONAL or example.social.gifts
   //and second is string with code itself
    
   "field": {
        "name": "affiliateCode" ,
        "body": affiliateCodeBody,
        "locale": "string"
    },
```

## mapObjectTypes field:
```
   const mapObjectTypesBody = JSON.stringify(["restaurant", "hotel"])
  
   "field": {
        "name": "mapObjectTypes" ,
        "body": mapObjectTypesBody,
        "locale": "string"
    },
```

## mapObjectTags field:
```
   const mapObjectTagsBody = JSON.stringify(["vegeterian", "parking"])
  
   "field": {
        "name": "mapObjectTags" ,
        "body": mapObjectTagsBody,
        "locale": "string"
    },
```


## mapMobileView field:
```
   const mapMobileViewBody = JSON.stringify({
        "topPoint" : number[], //ordered first from -180 to 180, second from -90 to 90
        "bottomPoint" : number[], //ordered first from -180 to 180, second from -90 to 90
        "center" : number[], //ordered first from -180 to 180, second from -90 to 90
        "zoom": number // from 1 to 18
   })
  
   "field": {
        "name": "mapMobileView" ,
        "body": mapMobileViewBody,
        "locale": "string"
    },
```

## mapDesktopView field:
```
   const mapDesktopViewBody = JSON.stringify({
        "topPoint" : number[], //ordered first from -180 to 180, second from -90 to 90
        "bottomPoint" : number[], //ordered first from -180 to 180, second from -90 to 90
        "center" : number[], //ordered first from -180 to 180, second from -90 to 90
        "zoom": number // from 1 to 18
   })
  
   "field": {
        "name": "mapDesktopView" ,
        "body": mapDesktopViewBody,
        "locale": "string"
    },
```

## mapRectangles field:
```
   const mapRectanglesBody = JSON.stringify([{
        "topPoint" : number[], //ordered first from -180 to 180, second from -90 to 90
        "bottomPoint" : number[], //ordered first from -180 to 180, second from -90 to 90
   }])
  
   "field": {
        "name": "mapRectangles" ,
        "body": mapRectanglesBody,
        "locale": "string"
    },
```

## mapObjectsList field:
```
   "field": {
        "name": "mapObjectsList" ,
        "body": string, //author_permlink list object
        "locale": "string"
    },
```
## walletAddress field:
```
    const walletAddressBody = JSON.stringify({
        "title" : string
        "symbol" : string // required
        "address" : string // required
   })
   
   "field": {
        "name": "walletAddress" ,
        "body": walletAddressBody,
        "locale": "string"
    },
```

## delegation field:
```
   "field": {
        "name": "delegation" ,
        "body": "string", //name of account that assigned as admin
        "locale": "string"
    },
```

## url field:
```
   "field": {
        "name": "url" ,
        "body": "string", 
        "locale": "string"
    },
```


## calories field:
```
   "field": {
        "name": "calories" ,
        "body": "string", 
        "locale": "string"
    },
```
## budget field:
```
   "field": {
        "name": "budget" ,
        "body": "string", 
        "locale": "string"
    },
```
## cookingTime field:
```
   "field": {
        "name": "cookingTime" ,
        "body": "string", 
        "locale": "string"
    },
```

