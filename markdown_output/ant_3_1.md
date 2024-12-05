# Token Usage and Cost Summary

Total Prompt Tokens: 18.147
Total Completion Tokens: 12.084
Total Tokens: 30.231

Estimated Cost:

- Input Cost: $0.0054
- Output Cost: $0.0073
- Total Cost: $0.0127

---

# Anthropic API Documentation - Workspace Management

ID: N/A
Channel Name: Anthropic
Published At: N/A
Processing Style: technical

---

## Summary

This document provides an overview of the Anthropic API related to workspace management, detailing the endpoints for creating, updating, and managing workspaces, along with the required headers and expected responses.

## Tags

API, Workspace Management, Anthropic, HTTP, JSON

## Key Points

- The Admin API key is required for authentication in all requests.
- The API supports various operations including creating, updating, and archiving workspaces.
- Responses include workspace details such as ID, name, creation date, and display color.

## Formatted Text

# Anthropic API - Workspace Management

## Create Workspace

### POST /v1/organizations/workspaces

### Headers

- **x-api-key**: `string` (required)  
  Your unique Admin API key for authentication. This key is required in the header of all Admin API requests to authenticate your account and access Anthropic's services. Get your Admin API key through the Console.
- **anthropic-version**: `string` (required)  
  The version of the Anthropic API you want to use. Read more about versioning and our version history here.

### Body

```json
{
  "name": "string" // Name of the Workspace
}
```

### Response

**200 - application/json**

```json
{
  "id": "string", // ID of the Workspace (required)
  "type": "workspace", // Object type (required)
  "name": "string", // Name of the Workspace (required)
  "created_at": "string", // RFC 3339 datetime string indicating when the Workspace was created (required)
  "archived_at": "string | null", // RFC 3339 datetime string indicating when the Workspace was archived, or null if not archived (required)
  "display_color": "string" // Hex color code representing the Workspace in the Anthropic Console (required)
}
```

### Example cURL Request

```bash
curl "https://api.anthropic.com/v1/organizations/workspaces" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --header "x-api-key: $ANTHROPIC_ADMIN_KEY" \
  --data '{
    "name": "Workspace Name"
  }'
```

### Example Response

**200**

```json
{
  "id": "wrkspc_01JwQvzr7rXLA5AGx3HKfFUJ",
  "type": "workspace",
  "name": "Workspace Name",
  "created_at": "2024-10-30T23:58:27.427722Z",
  "archived_at": "2024-11-01T23:59:27.427722Z",
  "display_color": "#6C5BB9"
}
```

================================================================================

# Anthropic API Documentation - Workspace Management

ID: Not available
Channel Name: Anthropic
Published At: Not available
Processing Style: technical

---

## Summary

This document provides an overview of the Anthropic API for managing workspaces, including endpoints for creating, updating, and retrieving workspace information. It details the required headers, path parameters, and response structure for API requests.

## Tags

Anthropic API, Workspace Management, API Reference, HTTP Methods, JSON Response

## Key Points

- The Admin API key is required for authentication in all requests.
- The API supports various operations such as creating, updating, and listing workspaces.
- Responses include essential workspace details such as ID, name, creation date, and display color.

## Formatted Text

# Anthropic API Documentation - Workspace Management

## API Endpoints

### Get Workspace

**GET** `/v1/organizations/workspaces/{workspace_id}`

#### Headers

- **x-api-key**: string (required)  
  Your unique Admin API key for authentication. This key is required in the header of all Admin API requests to authenticate your account and access Anthropic's services. Get your Admin API key through the Console.
- **anthropic-version**: string (required)  
  The version of the Anthropic API you want to use. Read more about versioning and our version history [here](#).

#### Path Parameters

- **workspace_id**: string (required)  
  ID of the Workspace.

### Response

**200 - application/json**

```json
{
  "id": "wrkspc_01JwQvzr7rXLA5AGx3HKfFUJ",
  "type": "workspace",
  "name": "Workspace Name",
  "created_at": "2024-10-30T23:58:27.427722Z",
  "archived_at": "2024-11-01T23:59:27.427722Z",
  "display_color": "#6C5BB9"
}
```

### Example cURL Request

```bash
curl "https://api.anthropic.com/v1/organizations/workspaces/wrkspc_01JwQvzr7rXLA5AGx3HKfFUJ" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --header "x-api-key: $ANTHROPIC_ADMIN_KEY"
```

Was this page helpful?

- Yes
- No

================================================================================

# Anthropic API Documentation - Workspace Member Management

ID: Not available
Channel Name: Anthropic
Published At: Not available
Processing Style: technical

---

## Summary

This document provides detailed information on managing workspace members within the Anthropic API, including how to update, create, and delete workspace members, along with the required parameters and headers for API requests.

## Tags

API Management, Anthropic, Workspace Management, REST API, JSON

## Key Points

- Overview of workspace member management in Anthropic API.
- Required headers for API requests including Admin API key and version.
- Path parameters necessary for identifying users and workspaces.
- Body parameters defining the role of the workspace member.
- Example cURL command for updating a workspace member.

## Formatted Text

# Anthropic API Documentation - Workspace Member Management

## Overview

This section details the API endpoints for managing workspace members in Anthropic.

### API Endpoints

- **Update Workspace Member**
  - **Method:** POST
  - **Endpoint:** `/v1/organizations/workspaces/{workspace_id}/members/{user_id}`

### Headers

- **x-api-key**:
  - _Type_: string
  - _Required_: Yes
  - _Description_: Your unique Admin API key for authentication. This key is required in the header of all Admin API requests to authenticate your account and access Anthropic's services. Get your Admin API key through the Console.
- **anthropic-version**:
  - _Type_: string
  - _Required_: Yes
  - _Description_: The version of the Anthropic API you want to use. Read more about versioning and our version history here.

### Path Parameters

- **user_id**:
  - _Type_: string
  - _Required_: Yes
  - _Description_: ID of the User.
- **workspace_id**:
  - _Type_: string
  - _Required_: Yes
  - _Description_: ID of the Workspace.

### Body

- **Content-Type**: application/json
- **Parameters**:
  - **workspace_role**:
    - _Type_: enum<string>
    - _Required_: Yes
    - _Description_: New workspace role for the User.
    - _Available options_: workspace_user, workspace_developer, workspace_admin, workspace_billing

### Response

- **200 - application/json**
  - **Fields**:
    - **type**:
      - _Type_: enum<string>
      - _Default_: workspace_member
      - _Required_: Yes
      - _Description_: Object type. For Workspace Members, this is always "workspace_member".
    - **user_id**:
      - _Type_: string
      - _Required_: Yes
      - _Description_: ID of the User.
    - **workspace_id**:
      - _Type_: string
      - _Required_: Yes
      - _Description_: ID of the Workspace.
    - **workspace_role**:
      - _Type_: enum<string>
      - _Required_: Yes
      - _Description_: Role of the Workspace Member.
      - _Available options_: workspace_user, workspace_developer, workspace_admin, workspace_billing

### Example cURL Command

```bash
curl "https://api.anthropic.com/v1/organizations/workspaces/wrkspc_01JwQvzr7rXLA5AGx3HKfFUJ/members/user_01WCz1FkmYMm4gnmykNKUu3Q" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --header "x-api-key: $ANTHROPIC_ADMIN_KEY" \
  --data '{
    "workspace_role": "workspace_user"
  }'
```

### Example Response

```json
{
  "type": "workspace_member",
  "user_id": "user_01WCz1FkmYMm4gnmykNKUu3Q",
  "workspace_id": "wrkspc_01JwQvzr7rXLA5AGx3HKfFUJ",
  "workspace_role": "workspace_user"
}
```

================================================================================

# Anthropic API Documentation - Workspace Management

ID: Not available
Channel Name: Anthropic
Published At: Not available
Processing Style: technical

---

## Summary

This document provides an overview of the Anthropic API related to workspace management, including how to archive a workspace, required headers, path parameters, and response structure.

## Tags

Anthropic API, Workspace Management, API Authentication, JSON Response, cURL

## Key Points

- Overview of workspace management features in the Anthropic API.
- Instructions for archiving a workspace using the Admin API.
- Required headers for API requests, including authentication key and versioning.
- Structure of the JSON response for workspace details.

## Formatted Text

# Anthropic API Documentation - Workspace Management

## Archive Workspace

### POST /v1/organizations/workspaces/{workspace_id}/archive

#### Headers

- **x-api-key**: `string` (required)  
  Your unique Admin API key for authentication. This key is required in the header of all Admin API requests to authenticate your account and access Anthropic's services. Get your Admin API key through the Console.
- **anthropic-version**: `string` (required)  
  The version of the Anthropic API you want to use. Read more about versioning and our version history [here](#).

#### Path Parameters

- **workspace_id**: `string` (required)  
  ID of the Workspace.

#### Response

- **200 - application/json**
  ```json
  {
    "id": "wrkspc_01JwQvzr7rXLA5AGx3HKfFUJ",
    "type": "workspace",
    "name": "Workspace Name",
    "created_at": "2024-10-30T23:58:27.427722Z",
    "archived_at": "2024-11-01T23:59:27.427722Z",
    "display_color": "#6C5BB9"
  }
  ```

### cURL Example

```bash
curl --request POST "https://api.anthropic.com/v1/organizations/workspaces/wrkspc_01JwQvzr7rXLA5AGx3HKfFUJ/archive" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --header "x-api-key: $ANTHROPIC_ADMIN_KEY"
```

================================================================================

# Anthropic API Documentation

ID: Not available
Channel Name: Anthropic
Published At: Not available
Processing Style: technical

---

## Summary

This document provides an overview of the Anthropic API, specifically focusing on workspace member management. It details the API endpoints for managing workspace members, including how to retrieve, create, update, and delete members, along with the necessary headers and parameters.

## Tags

API, Anthropic, Workspace Management, HTTP Methods, JSON, cURL

## Key Points

- The Anthropic API allows management of workspace members through various endpoints.
- Authentication is required using an Admin API key.
- The API supports pagination for member lists.
- Response includes metadata about the results, such as whether more results are available.

## Formatted Text

# Anthropic API Documentation

## Workspace Member Management

### List Workspace Members

**GET** `/v1/organizations/workspaces/{workspace_id}/members`

#### Headers

- **x-api-key**: `string` (required)  
  Your unique Admin API key for authentication. This key is required in the header of all Admin API requests to authenticate your account and access Anthropic's services. Get your Admin API key through the Console.
- **anthropic-version**: `string` (required)  
  The version of the Anthropic API you want to use. Read more about versioning and our version history here.

#### Path Parameters

- **workspace_id**: `string` (required)  
  ID of the Workspace.

#### Query Parameters

- **before_id**: `string`  
  ID of the object to use as a cursor for pagination. When provided, returns the page of results immediately before this object.
- **after_id**: `string`  
  ID of the object to use as a cursor for pagination. When provided, returns the page of results immediately after this object.
- **limit**: `integer` (default: 20)  
  Number of items to return per page. Defaults to 20. Ranges from 1 to 100.

#### Response

- **200 - application/json**

```json
{
  "data": [
    {
      "type": "workspace_member",
      "user_id": "user_01WCz1FkmYMm4gnmykNKUu3Q",
      "workspace_id": "wrkspc_01JwQvzr7rXLA5AGx3HKfFUJ",
      "workspace_role": "workspace_user"
    }
  ],
  "has_more": true,
  "first_id": "<string>",
  "last_id": "<string>"
}
```

### Example cURL Command

```bash
curl "https://api.anthropic.com/v1/organizations/workspaces/wrkspc_01JwQvzr7rXLA5AGx3HKfFUJ/members" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --header "x-api-key: $ANTHROPIC_ADMIN_KEY"
```

================================================================================

# Anthropic API Documentation

ID: N/A
Channel Name: Anthropic
Published At: N/A
Processing Style: technical

---

## Summary

This document provides an overview of the Anthropic API, specifically focusing on Workspace Member Management. It details the processes for creating, listing, updating, and deleting workspace members, along with the required headers and parameters for API requests.

## Tags

API, Anthropic, Workspace Management, Member Management, RESTful API

## Key Points

- The API requires an Admin API key for authentication.
- Workspace ID and User ID are mandatory parameters for member management.
- The API supports different roles for workspace members: user, developer, admin.
- Responses include status codes and JSON formatted data.

## Formatted Text

# Anthropic API Documentation

## Workspace Member Management

### Create Workspace Member

**POST** `/v1/organizations/workspaces/{workspace_id}/members`

#### Headers

- **x-api-key**: `string` (required)  
  Your unique Admin API key for authentication. This key is required in the header of all Admin API requests to authenticate your account and access Anthropic's services. Get your Admin API key through the Console.
- **anthropic-version**: `string` (required)  
  The version of the Anthropic API you want to use. Read more about versioning and our version history here.

#### Path Parameters

- **workspace_id**: `string` (required)  
  ID of the Workspace.

#### Body

```json
{
  "user_id": "string (required)",
  "workspace_role": "enum<string> (required)"
}
```

- **user_id**: `string` (required)  
  ID of the User.
- **workspace_role**: `enum<string>` (required)  
  Role of the new Workspace Member. Cannot be "workspace_billing".  
  Available options: `workspace_user`, `workspace_developer`, `workspace_admin`.

#### Response

- **200** - `application/json`

```json
{
  "type": "workspace_member",
  "user_id": "string (required)",
  "workspace_id": "string (required)",
  "workspace_role": "enum<string> (required)"
}
```

- **type**: `enum<string>` (default: `workspace_member`, required)  
  Object type. For Workspace Members, this is always "workspace_member".
- **user_id**: `string` (required)  
  ID of the User.
- **workspace_id**: `string` (required)  
  ID of the Workspace.
- **workspace_role**: `enum<string>` (required)  
  Role of the Workspace Member.  
  Available options: `workspace_user`, `workspace_developer`, `workspace_admin`, `workspace_billing`.

### Example cURL Request

```bash
curl "https://api.anthropic.com/v1/organizations/workspaces/wrkspc_01JwQvzr7rXLA5AGx3HKfFUJ/members" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --header "x-api-key: $ANTHROPIC_ADMIN_KEY" \
  --data '{
    "user_id": "user_01WCz1FkmYMm4gnmykNKUu3Q",
    "workspace_role": "workspace_user"
  }'
```

### Example Response

```json
{
  "type": "workspace_member",
  "user_id": "user_01WCz1FkmYMm4gnmykNKUu3Q",
  "workspace_id": "wrkspc_01JwQvzr7rXLA5AGx3HKfFUJ",
  "workspace_role": "workspace_user"
}
```

================================================================================

# Anthropic API Documentation - Workspace Member Management

ID: Not available
Channel Name: Anthropic
Published At: Not available
Processing Style: technical

---

## Summary

This document provides an overview of the Anthropic API for managing workspace members, including details on API requests, required headers, and response formats.

## Tags

Anthropic API, Workspace Management, API Reference, Developer Tools

## Key Points

- Overview of the Admin API for workspace member management.
- Required headers for API requests include Admin API key and version.
- Detailed explanation of path parameters and response structure.

## Formatted Text

# Anthropic API Documentation - Workspace Member Management

## API Endpoints

### Get Workspace Member

**GET** `/v1/organizations/workspaces/{workspace_id}/members/{user_id}`

#### Headers

- **x-api-key**: `string` (required)  
  Your unique Admin API key for authentication. This key is required in the header of all Admin API requests to authenticate your account and access Anthropic's services. Get your Admin API key through the Console.
- **anthropic-version**: `string` (required)  
  The version of the Anthropic API you want to use. Read more about versioning and our version history here.

#### Path Parameters

- **user_id**: `string` (required)  
  ID of the User.
- **workspace_id**: `string` (required)  
  ID of the Workspace.

### Response

**200 - application/json**

```json
{
  "type": "workspace_member",
  "user_id": "user_01WCz1FkmYMm4gnmykNKUu3Q",
  "workspace_id": "wrkspc_01JwQvzr7rXLA5AGx3HKfFUJ",
  "workspace_role": "workspace_user"
}
```

- **type**: `enum<string>` (required)  
  Object type. For Workspace Members, this is always "workspace_member". Available options: workspace_member.
- **user_id**: `string` (required)  
  ID of the User.
- **workspace_id**: `string` (required)  
  ID of the Workspace.
- **workspace_role**: `enum<string>` (required)  
  Role of the Workspace Member. Available options: workspace_user, workspace_developer, workspace_admin, workspace_billing.

### Example cURL Request

```bash
curl "https://api.anthropic.com/v1/organizations/workspaces/wrkspc_01JwQvzr7rXLA5AGx3HKfFUJ/members/user_01WCz1FkmYMm4gnmykNKUu3Q" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --header "x-api-key: $ANTHROPIC_ADMIN_KEY"
```

Was this page helpful?

- Yes
- No

================================================================================

# Anthropic API Documentation - Workspace Member Management

ID: Not available
Channel Name: Anthropic
Published At: Not available
Processing Style: technical

---

## Summary

This document provides an overview of the Workspace Member Management API for Anthropic, detailing how to manage workspace members, including creating, updating, and deleting members. It includes information on required headers, path parameters, and response formats.

## Tags

API Management, Workspace Management, Anthropic, REST API, Developer Tools

## Key Points

- The Admin API allows management of workspace members.
- Required headers include `x-api-key` for authentication and `anthropic-version` for specifying the API version.
- The API supports operations like GET, POST, and DELETE for workspace members.
- Responses include user and workspace IDs, along with the type of operation performed.

## Formatted Text

## Anthropic API - Workspace Member Management

### API Endpoints

- **Delete Workspace Member**
  - **Method:** DELETE
  - **Endpoint:** `/v1/organizations/workspaces/{workspace_id}/members/{user_id}`

### Headers

- **x-api-key**:
  - _Type:_ string
  - _Required:_ Yes
  - _Description:_ Your unique Admin API key for authentication. This key is required in the header of all Admin API requests to authenticate your account and access Anthropic's services. Get your Admin API key through the Console.
- **anthropic-version**:
  - _Type:_ string
  - _Required:_ Yes
  - _Description:_ The version of the Anthropic API you want to use. Read more about versioning and our version history here.

### Path Parameters

- **user_id**:
  - _Type:_ string
  - _Required:_ Yes
  - _Description:_ ID of the User.
- **workspace_id**:
  - _Type:_ string
  - _Required:_ Yes
  - _Description:_ ID of the Workspace.

### Response

- **200 - application/json**
  - **Response Body:**
    ```json
    {
      "user_id": "user_01WCz1FkmYMm4gnmykNKUu3Q",
      "workspace_id": "wrkspc_01JwQvzr7rXLA5AGx3HKfFUJ",
      "type": "workspace_member_deleted"
    }
    ```

### cURL Example

```bash
curl --request DELETE "https://api.anthropic.com/v1/organizations/workspaces/wrkspc_01JwQvzr7rXLA5AGx3HKfFUJ/members/user_01WCz1FkmYMm4gnmykNKUu3Q" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --header "x-api-key: $ANTHROPIC_ADMIN_KEY"
```

================================================================================

# Anthropic API Documentation

ID: N/A
Channel Name: Anthropic
Published At: N/A
Processing Style: technical

---

## Summary

This document provides an overview of the Anthropic API, focusing on organization member management, including user updates and retrieval. It details the required headers, path parameters, request body, and response structure for managing users within an organization.

## Tags

Anthropic API, User Management, API Reference, HTTP Methods, JSON, Authentication

## Key Points

- The Admin API key is required for authentication in all requests.
- Users can be assigned roles such as user, developer, or billing, but not admin.
- The API supports versioning, and the version must be specified in the request headers.
- Responses include user details such as ID, email, name, role, and the date the user joined the organization.

## Formatted Text

## Anthropic API Overview

### Organization Member Management

#### Update User

**POST /v1/organizations/users/{user_id}**
**Headers**

- `x-api-key`: Your unique Admin API key for authentication. This key is required in the header of all Admin API requests to authenticate your account and access Anthropic's services. Get your Admin API key through the Console.
- `anthropic-version`: The version of the Anthropic API you want to use. Read more about versioning and our version history here.
  **Path Parameters**
- `user_id`: ID of the User (string, required).
  **Body**

```json
{
  "role": "user"
}
```

- `role`: New role for the User (enum<string>, required). Cannot be "admin". Available options: user, developer, billing.
  **Response**
- `200 - application/json`

```json
{
  "id": "user_01WCz1FkmYMm4gnmykNKUu3Q",
  "type": "user",
  "email": "user@emaildomain.com",
  "name": "Jane Doe",
  "role": "user",
  "added_at": "2024-10-30T23:58:27.427722Z"
}
```

### cURL Example

To update a user, you can use the following cURL command:

```bash
curl "https://api.anthropic.com/v1/organizations/users/user_01WCz1FkmYMm4gnmykNKUu3Q" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --header "x-api-key: $ANTHROPIC_ADMIN_KEY" \
  --data '{
    "role": "user"
  }'
```

================================================================================

# Anthropic API Documentation

ID: N/A
Channel Name: Anthropic
Published At: N/A
Processing Style: technical

---

## Summary

This document provides an overview of the Anthropic API, focusing on organization member management, specifically the process for removing a user from an organization. It includes details on required headers, path parameters, response formats, and a cURL example for making API requests.

## Tags

Anthropic API, User Management, API Authentication, cURL, HTTP Methods

## Key Points

- The Admin API key is required for authentication in all requests.
- The API version must be specified in the request headers.
- The user ID is necessary for identifying which user to remove.
- A successful deletion returns a JSON response confirming the user has been deleted.

## Formatted Text

# Anthropic API Documentation

## Organization Member Management

### Remove User

**DELETE** `/v1/organizations/users/{user_id}`

#### Headers

- **x-api-key**: `string` (required)  
  Your unique Admin API key for authentication. This key is required in the header of all Admin API requests to authenticate your account and access Anthropic's services. Get your Admin API key through the Console.
- **anthropic-version**: `string` (required)  
  The version of the Anthropic API you want to use. Read more about versioning and our version history here.

#### Path Parameters

- **user_id**: `string` (required)  
  ID of the User.

#### Response

- **200 - application/json**
  ```json
  {
    "id": "user_01WCz1FkmYMm4gnmykNKUu3Q",
    "type": "user_deleted"
  }
  ```

### cURL Example

```bash
curl --request DELETE "https://api.anthropic.com/v1/organizations/users/user_01WCz1FkmYMm4gnmykNKUu3Q" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --header "x-api-key: $ANTHROPIC_ADMIN_KEY"
```

================================================================================

# Anthropic API Documentation

ID: N/A
Channel Name: Anthropic
Published At: N/A
Processing Style: technical

---

## Summary

This document provides an overview of the Anthropic API, specifically focusing on organization member management, including user management functionalities such as listing, updating, and removing users.

## Tags

API, Anthropic, User Management, HTTP Methods, JSON, cURL

## Key Points

- The Anthropic API allows for organization member management, including user listing and updates.
- Authentication is required via an Admin API key.
- Pagination is supported with `before_id` and `after_id` query parameters.
- The API returns user data in JSON format, including user ID, email, name, role, and timestamps.

## Formatted Text

# Anthropic API Documentation

## Organization Member Management

### List Users

**GET** `/v1/organizations/users`

#### Headers

- **x-api-key**: `string` (required)  
  Your unique Admin API key for authentication. This key is required in the header of all Admin API requests to authenticate your account and access Anthropic's services. Get your Admin API key through the Console.
- **anthropic-version**: `string` (required)  
  The version of the Anthropic API you want to use. Read more about versioning and our version history here.

#### Query Parameters

- **before_id**: `string`  
  ID of the object to use as a cursor for pagination. When provided, returns the page of results immediately before this object.
- **after_id**: `string`  
  ID of the object to use as a cursor for pagination. When provided, returns the page of results immediately after this object.
- **limit**: `integer` (default: 20)  
  Number of items to return per page. Defaults to 20. Ranges from 1 to 100.

#### Response

**200 - application/json**

```json
{
  "data": [
    {
      "id": "user_01WCz1FkmYMm4gnmykNKUu3Q",
      "type": "user",
      "email": "user@emaildomain.com",
      "name": "Jane Doe",
      "role": "user",
      "added_at": "2024-10-30T23:58:27.427722Z"
    }
  ],
  "has_more": true,
  "first_id": "<string>",
  "last_id": "<string>"
}
```

### cURL Example

```bash
curl "https://api.anthropic.com/v1/organizations/users" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --header "x-api-key: $ANTHROPIC_ADMIN_KEY"
```

Was this page helpful?

- Yes
- No

================================================================================

# Anthropic API Documentation - Organization Invites

ID: N/A
Channel Name: Anthropic
Published At: N/A
Processing Style: technical

---

## Summary

This document provides an overview of the Organization Invites functionality within the Anthropic API, detailing how to manage invites, including creating, listing, and retrieving invite details.

## Tags

Anthropic API, Organization Management, API Invites, Authentication, JSON

## Key Points

- The Admin API key is required for authentication in all requests.
- The API supports various operations related to organization invites, including creating and listing invites.
- Each invite contains details such as the invite ID, email of the invited user, role, timestamps for creation and expiration, and status.

## Formatted Text

# Anthropic API - Organization Invites

## API Endpoints

### Get Invite

**GET** `/v1/organizations/invites/{invite_id}`

### Headers

- **x-api-key**: string (required)  
  Your unique Admin API key for authentication. This key is required in the header of all Admin API requests to authenticate your account and access Anthropic's services. Get your Admin API key through the Console.
- **anthropic-version**: string (required)  
  The version of the Anthropic API you want to use. Read more about versioning and our version history [here](#).

### Path Parameters

- **invite_id**: string (required)  
  ID of the Invite.

### Response

**200 - application/json**

```json
{
  "id": "invite_015gWxCN9Hfg2QhZwTK7Mdeu",
  "type": "invite",
  "email": "user@emaildomain.com",
  "role": "user",
  "invited_at": "2024-10-30T23:58:27.427722Z",
  "expires_at": "2024-11-20T23:58:27.427722Z",
  "status": "pending"
}
```

### Response Fields

- **id**: string (required)  
  ID of the Invite.
- **type**: enum<string> (default: invite, required)  
  Object type. For Invites, this is always "invite".
- **email**: string (required)  
  Email of the User being invited.
- **role**: enum<string> (required)  
  Organization role of the User. Available options: user, developer, billing, admin.
- **invited_at**: string (required)  
  RFC 3339 datetime string indicating when the Invite was created.
- **expires_at**: string (required)  
  RFC 3339 datetime string indicating when the Invite expires.
- **status**: enum<string> (required)  
  Status of the Invite. Available options: accepted, expired, deleted, pending.

## Example cURL Request

```bash
curl "https://api.anthropic.com/v1/organizations/invites/invite_015gWxCN9Hfg2QhZwTK7Mdeu" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --header "x-api-key: $ANTHROPIC_ADMIN_KEY"
```

================================================================================

# Anthropic API Documentation

ID: Not available
Channel Name: Anthropic
Published At: Not available
Processing Style: technical

---

## Summary

This document provides an overview of the Anthropic API, specifically focusing on organization member management, including user retrieval and details about required headers and parameters.

## Tags

Anthropic, API, User Management, REST API, JSON, Authentication

## Key Points

- Overview of the Anthropic API for managing organization members.
- Detailed instructions on how to retrieve user information using the Admin API.
- Required headers and parameters for API requests.
- Example cURL command for fetching user details.

## Formatted Text

# Anthropic API Documentation

## Organization Member Management

### Get User

**GET** `/v1/organizations/users/{user_id}`

#### Headers

- **x-api-key**: `string` (required)  
  Your unique Admin API key for authentication. This key is required in the header of all Admin API requests to authenticate your account and access Anthropic's services. Get your Admin API key through the Console.
- **anthropic-version**: `string` (required)  
  The version of the Anthropic API you want to use. Read more about versioning and our version history here.

#### Path Parameters

- **user_id**: `string` (required)  
  ID of the User.

#### Response

**200 - application/json**

```json
{
  "id": "user_01WCz1FkmYMm4gnmykNKUu3Q",
  "type": "user",
  "email": "user@emaildomain.com",
  "name": "Jane Doe",
  "role": "user",
  "added_at": "2024-10-30T23:58:27.427722Z"
}
```

### Example cURL Command

```bash
curl "https://api.anthropic.com/v1/organizations/users/user_01WCz1FkmYMm4gnmykNKUu3Q" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --header "x-api-key: $ANTHROPIC_ADMIN_KEY"
```

================================================================================

# Anthropic API Documentation - Organization Invites

ID: N/A
Channel Name: Anthropic
Published At: N/A
Processing Style: technical

---

## Summary

This document provides detailed information about the Organization Invites feature of the Anthropic API, including how to list, create, and manage invites within an organization.

## Tags

API, Anthropic, Organization Management, HTTP Requests, JSON, cURL

## Key Points

- The Admin API key is required for authentication in all requests.
- Pagination can be managed using `before_id` and `after_id` query parameters.
- The default limit for items returned per page is 20, with a maximum of 100.
- The response includes details about invites, including ID, email, role, and status.

## Formatted Text

## Organization Invites

### List Invites

**GET** `/v1/organizations/invites`

#### Headers

- `x-api-key`: string (required)  
  Your unique Admin API key for authentication. This key is required in the header of all Admin API requests to authenticate your account and access Anthropic's services. Get your Admin API key through the Console.
- `anthropic-version`: string (required)  
  The version of the Anthropic API you want to use. Read more about versioning and our version history here.

#### Query Parameters

- `before_id`: string  
  ID of the object to use as a cursor for pagination. When provided, returns the page of results immediately before this object.
- `after_id`: string  
  ID of the object to use as a cursor for pagination. When provided, returns the page of results immediately after this object.
- `limit`: integer (default: 20)  
  Number of items to return per page. Defaults to 20. Ranges from 1 to 100.

#### Response

- **200 - application/json**

```json
{
  "data": [
    {
      "id": "invite_015gWxCN9Hfg2QhZwTK7Mdeu",
      "type": "invite",
      "email": "user@emaildomain.com",
      "role": "user",
      "invited_at": "2024-10-30T23:58:27.427722Z",
      "expires_at": "2024-11-20T23:58:27.427722Z",
      "status": "pending"
    }
  ],
  "has_more": true,
  "first_id": "<string>",
  "last_id": "<string>"
}
```

### cURL Example

To create an invite, you can use the following cURL command:

```bash
curl https://api.anthropic.com/v1/organizations/invites \
     --header "x-api-key: $ANTHROPIC_ADMIN_KEY" \
     --header "anthropic-version: 2023-06-01"
```

================================================================================

# Anthropic API Documentation - Organization Invites

ID: N/A
Channel Name: Anthropic
Published At: N/A
Processing Style: technical

---

## Summary

This document provides an overview of the Organization Invites feature in the Anthropic API, detailing how to create, list, and delete invites for users within an organization. It includes information on required headers, request body parameters, and response formats.

## Tags

Anthropic API, Organization Invites, API Authentication, JSON, HTTP Methods

## Key Points

- The Admin API key is required for authentication in all requests.
- The API supports creating invites with specific roles (user, developer, billing).
- Responses include invite details such as ID, email, role, creation date, expiration date, and status.

## Formatted Text

## Organization Invites

### Create Invite

**POST** `/v1/organizations/invites`

#### Headers

- **x-api-key**: `string` (required)  
  Your unique Admin API key for authentication. This key is required in the header of all Admin API requests to authenticate your account and access Anthropic's services. Get your Admin API key through the Console.
- **anthropic-version**: `string` (required)  
  The version of the Anthropic API you want to use. Read more about versioning and our version history here.

#### Body

```json
{
  "email": "string (required)",
  "role": "enum<string> (required)"
}
```

- **email**: `string` (required)  
  Email of the User.
- **role**: `enum<string>` (required)  
  Role for the invited User. Cannot be "admin". Available options: user, developer, billing.

#### Response

**200 - application/json**

```json
{
  "id": "string (required)",
  "type": "enum<string> (default: invite, required)",
  "email": "string (required)",
  "role": "enum<string> (required)",
  "invited_at": "string (required)",
  "expires_at": "string (required)",
  "status": "enum<string> (required)"
}
```

- **id**: `string` (required) - ID of the Invite.
- **type**: `enum<string>` (required) - Object type. For Invites, this is always "invite".
- **email**: `string` (required) - Email of the User being invited.
- **role**: `enum<string>` (required) - Organization role of the User. Available options: user, developer, billing, admin.
- **invited_at**: `string` (required) - RFC 3339 datetime string indicating when the Invite was created.
- **expires_at**: `string` (required) - RFC 3339 datetime string indicating when the Invite expires.
- **status**: `enum<string>` (required) - Status of the Invite. Available options: accepted, expired, deleted, pending.

### Example cURL Request

```bash
curl "https://api.anthropic.com/v1/organizations/invites" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --header "x-api-key: $ANTHROPIC_ADMIN_KEY" \
  --data '{
    "email": "user@emaildomain.com",
    "role": "user"
  }'
```

### Example Response

```json
{
  "id": "invite_015gWxCN9Hfg2QhZwTK7Mdeu",
  "type": "invite",
  "email": "user@emaildomain.com",
  "role": "user",
  "invited_at": "2024-10-30T23:58:27.427722Z",
  "expires_at": "2024-11-20T23:58:27.427722Z",
  "status": "pending"
}
```

================================================================================

# Anthropic API Documentation

ID: Not available
Channel Name: Anthropic
Published At: Not available
Processing Style: technical

---

## Summary

This document provides an overview of the Anthropic API, detailing the process for managing API keys, including creating, listing, and updating keys. It includes information on required headers, path parameters, and the response structure for API key operations.

## Tags

API, Anthropic, API Keys, Authentication, JSON, cURL

## Key Points

- Overview of Anthropic API key management
- Required headers for API requests
- Structure of API key creation and management requests
- Example cURL command for listing API keys
- Response structure for API key operations

## Formatted Text

# Anthropic API Documentation

## API Key Management

### Overview

The Anthropic API allows users to manage API keys for authentication and access to services. This includes creating, listing, and updating API keys.

### Required Headers

- **x-api-key**: Your unique Admin API key for authentication. This key is required in the header of all Admin API requests.
- **anthropic-version**: The version of the Anthropic API you want to use.

### Path Parameters

- **api_key_id**: ID of the API key.

### Request Body

```json
{
  "name": "string",
  "status": "enum<string> | null"
}
```

- **name**: Name of the API key.
- **status**: Status of the API key (options: active, inactive, archived).

### Response Structure

```json
{
  "id": "string",
  "type": "enum<string>",
  "name": "string",
  "workspace_id": "string | null",
  "created_at": "string",
  "created_by": {
    "id": "string",
    "type": "string"
  },
  "partial_key_hint": "string | null",
  "status": "enum<string>"
}
```

- **id**: ID of the API key.
- **type**: Object type (always "api_key").
- **name**: Name of the API key.
- **workspace_id**: ID of the Workspace associated with the API key.
- **created_at**: Creation timestamp of the API key.
- **created_by**: Information about the creator of the API key.
- **partial_key_hint**: Partially redacted hint for the API key.
- **status**: Status of the API key.

### Example cURL Command

To list an API key, use the following command:

```bash
curl "https://api.anthropic.com/v1/organizations/api_keys/apikey_01Rj2N8SVvo6BePZj99NhmiT" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --header "x-api-key: $ANTHROPIC_ADMIN_KEY" \
  --data '{
    "status": "active",
    "name": "Developer Key"
  }'
```

### Example Response

```json
{
  "id": "apikey_01Rj2N8SVvo6BePZj99NhmiT",
  "type": "api_key",
  "name": "Developer Key",
  "workspace_id": "wrkspc_01JwQvzr7rXLA5AGx3HKfFUJ",
  "created_at": "2024-10-30T23:58:27.427722Z",
  "created_by": {
    "id": "user_01WCz1FkmYMm4gnmykNKUu3Q",
    "type": "user"
  },
  "partial_key_hint": "sk-ant-api03-R2D...igAA",
  "status": "active"
}
```

================================================================================

# Anthropic API Documentation - Organization Invites

ID: N/A
Channel Name: Anthropic
Published At: N/A
Processing Style: technical

---

## Summary

This document provides an overview of the Organization Invites feature within the Anthropic API, detailing the process for managing invites, including creating, listing, and deleting invites. It includes information on required headers, path parameters, and example requests.

## Tags

Anthropic API, Organization Invites, API Management, HTTP Methods, API Authentication

## Key Points

- Overview of the Organization Invites management in the Anthropic API.
- Required headers for API requests include Admin API key and versioning.
- Path parameters must include the invite ID for specific invite actions.
- Example cURL command provided for deleting an invite.

## Formatted Text

# Anthropic API Documentation - Organization Invites

## Overview

The Organization Invites feature allows users to manage invites within the Anthropic API. This includes operations such as creating, listing, and deleting invites.

## API Endpoints

### Delete Invite

**DELETE** `/v1/organizations/invites/{invite_id}`

#### Headers

- **x-api-key**: `string` (required)  
  Your unique Admin API key for authentication. This key is required in the header of all Admin API requests to authenticate your account and access Anthropic's services. Get your Admin API key through the Console.
- **anthropic-version**: `string` (required)  
  The version of the Anthropic API you want to use. Read more about versioning and our version history here.

#### Path Parameters

- **invite_id**: `string` (required)  
  ID of the Invite.

#### Response

- **200 - application/json**
  ```json
  {
    "id": "invite_015gWxCN9Hfg2QhZwTK7Mdeu",
    "type": "invite_deleted"
  }
  ```

## Example cURL Command

To delete an invite, you can use the following cURL command:

```bash
curl --request DELETE "https://api.anthropic.com/v1/organizations/invites/invite_015gWxCN9Hfg2QhZwTK7Mdeu" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --header "x-api-key: $ANTHROPIC_ADMIN_KEY"
```

Was this page helpful?

- Yes
- No

================================================================================

# Anthropic API Documentation

ID: N/A
Channel Name: Anthropic
Published At: N/A
Processing Style: technical

---

## Summary

This document provides an overview of the Anthropic API, including details on API keys, request headers, query parameters, and response formats. It serves as a guide for developers to interact with the Anthropic services effectively.

## Tags

API, Anthropic, Authentication, JSON, Developer Guide

## Key Points

- Overview of Anthropic API functionalities and endpoints.
- Detailed explanation of required headers for API requests.
- Pagination support through query parameters.
- Example of a cURL command for API interaction.
- Structure of the JSON response for API key requests.

## Formatted Text

# Anthropic API Documentation

## Overview

The Anthropic API allows developers to interact with various services provided by Anthropic. This includes managing API keys, handling message batches, and utilizing text completions.

## API Keys

### Endpoints

- **GET** `/v1/organizations/api_keys` - List API Keys
- **GET** `/v1/organizations/api_keys/{id}` - Get API Key
- **POST** `/v1/organizations/api_keys/{id}` - Update API Key

### Required Headers

- **x-api-key**: Your unique Admin API key for authentication. This key is required in the header of all Admin API requests to authenticate your account and access Anthropic's services. Get your Admin API key through the Console.
- **anthropic-version**: The version of the Anthropic API you want to use.

### Query Parameters

- **before_id**: ID of the object to use as a cursor for pagination.
- **after_id**: ID of the object to use as a cursor for pagination.
- **limit**: Number of items to return per page (default: 20, ranges from 1 to 100).
- **status**: Filter by API key status (options: active, inactive, archived).
- **workspace_id**: Filter by Workspace ID.
- **created_by_user_id**: Filter by the ID of the User who created the object.

### Response Format

- **200 - application/json**

```json
{
  "data": [
    {
      "id": "apikey_01Rj2N8SVvo6BePZj99NhmiT",
      "type": "api_key",
      "name": "Developer Key",
      "workspace_id": "wrkspc_01JwQvzr7rXLA5AGx3HKfFUJ",
      "created_at": "2024-10-30T23:58:27.427722Z",
      "created_by": {
        "id": "user_01WCz1FkmYMm4gnmykNKUu3Q",
        "type": "user"
      },
      "partial_key_hint": "sk-ant-api03-R2D...igAA",
      "status": "active"
    }
  ],
  "has_more": true,
  "first_id": "<string>",
  "last_id": "<string>"
}
```

## Example cURL Command

```bash
curl "https://api.anthropic.com/v1/organizations/api_keys" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --header "x-api-key: $ANTHROPIC_ADMIN_KEY"
```

================================================================================

# Anthropic API Documentation

ID: Not available
Channel Name: Anthropic
Published At: Not available
Processing Style: technical

---

## Summary

This document provides an overview of the Anthropic API, including details on API key management, request headers, path parameters, and response formats. It also includes a sample cURL command for retrieving API key information.

## Tags

Anthropic, API, API Keys, Authentication, cURL, JSON, Developer Tools

## Key Points

- Overview of Anthropic API and its functionalities.
- Instructions for managing API keys, including creation and retrieval.
- Required headers for API requests, including authentication details.
- Sample response structure for API key retrieval.

## Formatted Text

# Anthropic API Documentation

## Overview

The Anthropic API allows developers to interact with Anthropic's services through various endpoints. This document outlines the process for managing API keys and provides examples of how to make requests.

## API Key Management

### API Keys

- **Get Api Key**: Retrieve details of a specific API key.
- **List Api Keys**: List all API keys associated with your account.
- **Update Api Key**: Modify an existing API key.

### Required Headers

- **x-api-key**: Your unique Admin API key for authentication. This key is required in the header of all Admin API requests to authenticate your account and access Anthropic's services.
- **anthropic-version**: The version of the Anthropic API you want to use.

### Path Parameters

- **api_key_id**: ID of the API key.

### Response Format

- **200 - application/json**

```json
{
  "id": "apikey_01Rj2N8SVvo6BePZj99NhmiT",
  "type": "api_key",
  "name": "Developer Key",
  "workspace_id": "wrkspc_01JwQvzr7rXLA5AGx3HKfFUJ",
  "created_at": "2024-10-30T23:58:27.427722Z",
  "created_by": {
    "id": "user_01WCz1FkmYMm4gnmykNKUu3Q",
    "type": "user"
  },
  "partial_key_hint": "sk-ant-api03-R2D...igAA",
  "status": "active"
}
```

### Sample cURL Command

```bash
curl "https://api.anthropic.com/v1/organizations/api_keys/apikey_01Rj2N8SVvo6BePZj99NhmiT" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --header "x-api-key: $ANTHROPIC_ADMIN_KEY"
```

================================================================================
