# Tree API

Simple tree-like API

# Auth

Sign up or log in to obtain a JWT token and make requests as:

**Headers**
```
Authorization: "eyJhbGc..."
```

# Endpoints

### POST /api/auth/signup

Sign up to obtain a JWT token

```
Body:

{
  "email": "string",
  "password": "string"
}
```

*Response*

**201**
```
{
  "token": "eyJhbGc..."
}
```

### POST /api/auth/login

Log in to obtain a JWT token

```
Body:

{
  "email": "string",
  "password": "string"
}
```

*Response*

**200**
```
{
  "token": "eyJhbGc..."
}
```

**400**
```
{
  "error": "Invalid login."
}
```

### GET /node/:id

Gets a node (with child nodes) by id

**200**
```
{
  "_id": "61c1a5a8aaf3b89343aea661",
  "title": "My First Node",
  "payload": "Hello World!",
  "user": "61c063ee401d3e99d45a82f2",
  "parent": null,
  "__v": 0,
  "children": []
}
```
**404**
```
{
  "error": "Not found."
}
```

### GET /node

Get all root nodes for a user

**200**
```
{
    "nodes": [
        {
            "_id": "61c1a5a8aaf3b89343aea661",
            "title": "My First Node",
            "payload": "Hello World!",
            "user": "61c063ee401d3e99d45a82f2",
            "parent": null,
            "__v": 0,
            "children": []
        },
        {
            "_id": "61c1a870c83d1f28e22e2b6e",
            "title": "My Second Node",
            "payload": "Hello again!",
            "user": "61c063ee401d3e99d45a82f2",
            "parent": null,
            "__v": 0,
            "children": [
                {
                    "_id": "61c1abe0e5b12582798f93bd",
                    "title": "A Child Node",
                    "payload": "I am a child node!",
                    "user": "61c063ee401d3e99d45a82f2",
                    "parent": "61c1a870c83d1f28e22e2b6e",
                    "__v": 0
                },
                {
                    "_id": "61c1ae33f681480729e2b323",
                    "title": "Another Child Node",
                    "payload": "I am also a child node!",
                    "user": "61c063ee401d3e99d45a82f2",
                    "parent": "61c1a870c83d1f28e22e2b6e",
                    "__v": 0
                }
            ]
        }
    ]
}
```
