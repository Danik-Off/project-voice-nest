# ProjectVoice API Documentation

Полная документация REST API для ProjectVoice - голосового приложения с поддержкой WebRTC.

## Содержание

- [Базовый URL](#базовый-url)
- [Аутентификация](#аутентификация)
- [Эндпоинты](#эндпоинты)
    - [Auth (Аутентификация)](#auth-аутентификация)
    - [Users (Пользователи)](#users-пользователи)
    - [Servers (Серверы)](#servers-серверы)
    - [Channels (Каналы)](#channels-каналы)
    - [Messages (Сообщения)](#messages-сообщения)
    - [ServerMembers (Участники серверов)](#servermembers-участники-серверов)
    - [Invites (Приглашения)](#invites-приглашения)
    - [Friends (Друзья)](#friends-друзья)
    - [Roles (Роли)](#roles-роли)
    - [Admin (Административная панель)](#admin-административная-панель)
- [WebSocket / WebRTC](#websocket--webrtc)
- [Коды ошибок](#коды-ошибок)
- [Примеры использования](#примеры-использования)

## Базовый URL

```
http://localhost:5000/api
```

## Аутентификация

Большинство эндпоинтов требуют аутентификации через JWT токен. Токен передается в заголовке `Authorization`:

```
Authorization: Bearer <your_jwt_token>
```

Токен получается при регистрации или входе в систему и действителен в течение 7 дней.

## Эндпоинты

### Auth (Аутентификация)

#### POST `/api/auth/register`

Регистрация нового пользователя.

**Тело запроса:**

```json
{
    "username": "string",
    "email": "string",
    "password": "string"
}
```

**Ответ (201):**

```json
{
    "token": "jwt_token_here"
}
```

**Ошибки:**

- `400` - Не переданы обязательные параметры или пользователь уже существует
- `500` - Ошибка сервера

---

#### POST `/api/auth/login`

Вход в систему.

**Тело запроса:**

```json
{
    "email": "string",
    "password": "string"
}
```

**Ответ (200):**

```json
{
    "token": "jwt_token_here",
    "user": {
        "id": 1,
        "username": "string",
        "email": "string",
        "role": "user",
        "isActive": true
    }
}
```

**Ошибки:**

- `400` - Неверный пароль
- `404` - Пользователь не найден
- `500` - Ошибка сервера

---

#### GET `/api/auth/me`

Получение информации о текущем пользователе.

**Требуется:** Аутентификация

**Ответ (200):**

```json
{
    "id": 1,
    "username": "string",
    "email": "string",
    "role": "user",
    "isActive": true,
    "profilePicture": "string",
    "status": "online",
    "tag": "string",
    "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### Users (Пользователи)

#### GET `/api/users/`

Получение информации о текущем пользователе.

**Требуется:** Аутентификация

**Ответ (200):**

```json
{
    "id": 1,
    "username": "string",
    "profilePicture": "string",
    "bio": "string",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

#### GET `/api/users/:id`

Получение информации о пользователе по ID.

**Требуется:** Аутентификация

**Ответ (200):**

```json
{
    "id": 1,
    "name": "string",
    "profilePicture": "string",
    "bio": "string",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

#### PUT `/api/users/`

Обновление профиля текущего пользователя.

**Требуется:** Аутентификация

**Тело запроса:**

```json
{
    "name": "string",
    "profilePicture": "string",
    "bio": "string"
}
```

**Ответ (200):**

```json
{
    "id": 1,
    "username": "string",
    "profilePicture": "string",
    "bio": "string"
}
```

---

#### DELETE `/api/users/`

Удаление аккаунта текущего пользователя.

**Требуется:** Аутентификация

**Ответ (200):**

```json
{
    "message": "User deleted successfully"
}
```

---

### Servers (Серверы)

#### GET `/api/servers`

Получение списка серверов, в которых участвует пользователь.

**Требуется:** Аутентификация

**Ответ (200):**

```json
[
    {
        "id": 1,
        "name": "string",
        "description": "string",
        "icon": "string",
        "ownerId": 1,
        "channels": [],
        "members": []
    }
]
```

---

#### POST `/api/servers`

Создание нового сервера.

**Требуется:** Аутентификация

**Тело запроса:**

```json
{
    "name": "string",
    "description": "string",
    "icon": "string"
}
```

**Ответ (201):**

```json
{
    "id": 1,
    "name": "string",
    "description": "string",
    "icon": "string",
    "ownerId": 1
}
```

---

#### GET `/api/servers/:id`

Получение информации о сервере по ID.

**Требуется:** Аутентификация

**Ответ (200):**

```json
{
    "id": 1,
    "name": "string",
    "description": "string",
    "icon": "string",
    "ownerId": 1,
    "channels": [],
    "members": []
}
```

**Ошибки:**

- `403` - Сервер заблокирован

---

#### PUT `/api/servers/:id`

Обновление сервера.

**Требуется:** Аутентификация, права владельца или администратора

**Тело запроса:**

```json
{
    "name": "string",
    "description": "string",
    "icon": "string"
}
```

---

#### DELETE `/api/servers/:id`

Удаление сервера.

**Требуется:** Аутентификация, права владельца или администратора

**Ответ (204):** No Content

---

### Channels (Каналы)

#### GET `/api/servers/:serverId/channels`

Получение списка каналов сервера.

**Требуется:** Аутентификация

**Ответ (200):**

```json
[
    {
        "id": 1,
        "name": "string",
        "type": "text",
        "serverId": 1
    }
]
```

---

#### POST `/api/servers/:serverId/channels`

Создание нового канала.

**Требуется:** Аутентификация, права модератора

**Тело запроса:**

```json
{
    "name": "string",
    "type": "text"
}
```

**Типы каналов:** `text`, `voice`

**Ответ (201):**

```json
{
    "id": 1,
    "name": "string",
    "type": "text",
    "serverId": 1
}
```

---

#### GET `/api/servers/:serverId/channels/:channelId`

Получение информации о канале.

**Ответ (200):**

```json
{
    "id": 1,
    "name": "string",
    "type": "text",
    "serverId": 1
}
```

---

#### PUT `/api/servers/:serverId/channels/:channelId`

Обновление канала.

**Требуется:** Аутентификация, права модератора

**Тело запроса:**

```json
{
    "name": "string",
    "type": "text"
}
```

---

#### DELETE `/api/servers/:serverId/channels/:channelId`

Удаление канала.

**Требуется:** Аутентификация, права модератора

**Ответ (204):** No Content

---

### Messages (Сообщения)

#### GET `/api/messages`

Получение сообщений канала с пагинацией.

**Требуется:** Аутентификация

**Query параметры:**

- `channelId` (required) - ID канала
- `page` (optional, default: 1) - Номер страницы
- `limit` (optional, default: 50) - Количество сообщений на странице

**Ответ (200):**

```json
{
    "messages": [
        {
            "id": 1,
            "content": "string",
            "userId": 1,
            "channelId": 1,
            "createdAt": "2024-01-01T00:00:00.000Z",
            "updatedAt": "2024-01-01T00:00:00.000Z",
            "user": {
                "id": 1,
                "username": "string",
                "avatar": "string"
            },
            "isEdited": false
        }
    ],
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2
}
```

---

#### POST `/api/messages`

Создание нового сообщения.

**Требуется:** Аутентификация

**Тело запроса:**

```json
{
    "content": "string",
    "channelId": 1
}
```

**Ответ (201):**

```json
{
    "id": 1,
    "content": "string",
    "userId": 1,
    "channelId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "user": {
        "id": 1,
        "username": "string",
        "avatar": "string"
    },
    "isEdited": false
}
```

---

#### PUT `/api/messages/:id`

Обновление сообщения.

**Требуется:** Аутентификация (только автор или модератор)

**Тело запроса:**

```json
{
    "content": "string"
}
```

**Ответ (200):**

```json
{
    "id": 1,
    "content": "string",
    "isEdited": true
}
```

---

#### DELETE `/api/messages/:id`

Удаление сообщения.

**Требуется:** Аутентификация (только автор или модератор)

**Ответ (204):** No Content

---

#### GET `/api/messages/search`

Поиск сообщений в канале.

**Требуется:** Аутентификация

**Query параметры:**

- `query` (required) - Поисковый запрос
- `channelId` (required) - ID канала
- `page` (optional, default: 1)
- `limit` (optional, default: 50)

**Ответ (200):**

```json
{
    "messages": [],
    "total": 0,
    "page": 1,
    "limit": 50,
    "totalPages": 0
}
```

---

### ServerMembers (Участники серверов)

#### GET `/api/serverMembers/:serverId/members`

Получение списка участников сервера.

**Требуется:** Аутентификация

**Ответ (200):**

```json
[
    {
        "id": 1,
        "userId": 1,
        "serverId": 1,
        "role": "member",
        "user": {
            "id": 1,
            "username": "string",
            "profilePicture": "string"
        }
    }
]
```

---

#### POST `/api/serverMembers/:serverId/members`

Добавление участника на сервер.

**Требуется:** Аутентификация, права модератора

**Тело запроса:**

```json
{
    "userId": 1,
    "role": "member"
}
```

**Роли:** `member`, `moderator`, `admin`

---

#### PUT `/api/serverMembers/:serverId/members/:memberId`

Обновление роли участника.

**Требуется:** Аутентификация, права администратора

**Тело запроса:**

```json
{
    "role": "moderator"
}
```

---

#### DELETE `/api/serverMembers/:serverId/members/:memberId`

Удаление участника из сервера.

**Требуется:** Аутентификация, права администратора

**Ответ (204):** No Content

---

#### POST `/api/serverMembers/:serverId/owner`

Назначение нового владельца сервера.

**Требуется:** Аутентификация, права владельца

**Тело запроса:**

```json
{
    "userId": 1
}
```

---

### Invites (Приглашения)

#### POST `/api/invite/:serverId/invite`

Создание приглашения на сервер.

**Требуется:** Аутентификация, права модератора

**Тело запроса:**

```json
{
    "expiresAt": "2024-12-31T23:59:59.000Z",
    "maxUses": 10
}
```

**Ответ (201):**

```json
{
    "invite": {
        "id": 1,
        "token": "uuid-token",
        "serverId": 1,
        "createdBy": 1,
        "maxUses": 10,
        "uses": 0,
        "expiresAt": "2024-12-31T23:59:59.000Z"
    }
}
```

---

#### GET `/api/invite/invite/:token`

Получение информации о приглашении (публичный эндпоинт).

**Ответ (200):**

```json
{
    "invite": {
        "id": 1,
        "token": "uuid-token",
        "serverId": 1,
        "maxUses": 10,
        "uses": 0,
        "expiresAt": "2024-12-31T23:59:59.000Z"
    },
    "server": {
        "id": 1,
        "name": "string",
        "description": "string",
        "icon": "string"
    }
}
```

---

#### POST `/api/invite/invite/:token/accept`

Принятие приглашения.

**Требуется:** Аутентификация

**Ответ (200):**

```json
{
    "message": "User added to server"
}
```

---

#### GET `/api/invite/:serverId/invites`

Получение списка приглашений сервера.

**Требуется:** Аутентификация, права модератора

**Ответ (200):**

```json
[
    {
        "id": 1,
        "token": "uuid-token",
        "serverId": 1,
        "createdBy": 1,
        "maxUses": 10,
        "uses": 0,
        "expiresAt": "2024-12-31T23:59:59.000Z"
    }
]
```

---

#### DELETE `/api/invite/:inviteId`

Удаление приглашения.

**Требуется:** Аутентификация, права администратора

**Ответ (204):** No Content

---

### Friends (Друзья)

#### GET `/api/friends`

Получение списка друзей текущего пользователя.

**Требуется:** Аутентификация

**Ответ (200):**

```json
[
    {
        "id": 1,
        "username": "string",
        "profilePicture": "string",
        "status": "online",
        "tag": "string"
    }
]
```

---

#### GET `/api/friends/requests`

Получение входящих и исходящих запросов в друзья.

**Требуется:** Аутентификация

**Ответ (200):**

```json
{
    "incoming": [
        {
            "id": 1,
            "user": {
                "id": 1,
                "username": "string",
                "profilePicture": "string",
                "tag": "string"
            },
            "createdAt": "2024-01-01T00:00:00.000Z"
        }
    ],
    "outgoing": [
        {
            "id": 2,
            "user": {
                "id": 2,
                "username": "string",
                "profilePicture": "string",
                "tag": "string"
            },
            "createdAt": "2024-01-01T00:00:00.000Z"
        }
    ]
}
```

---

#### POST `/api/friends/request`

Отправка запроса в друзья.

**Требуется:** Аутентификация

**Тело запроса:**

```json
{
    "friendId": 1
}
```

**Ответ (201):**

```json
{
    "message": "Запрос в друзья отправлен.",
    "request": {
        "id": 1,
        "userId": 1,
        "friendId": 2,
        "status": "pending"
    }
}
```

**Ошибки:**

- `400` - Нельзя добавить себя / уже друзья / запрос уже отправлен
- `403` - Пользователь заблокирован
- `404` - Пользователь не найден

---

#### POST `/api/friends/accept/:requestId`

Принятие запроса в друзья.

**Требуется:** Аутентификация

**Ответ (200):**

```json
{
    "message": "Запрос в друзья принят."
}
```

---

#### DELETE `/api/friends/:id`

Удаление друга или отклонение запроса.

**Требуется:** Аутентификация

**Ответ (200):**

```json
{
    "message": "Друг удален или запрос отклонен."
}
```

---

#### POST `/api/friends/block/:targetUserId`

Блокировка пользователя.

**Требуется:** Аутентификация

**Ответ (200):**

```json
{
    "message": "Пользователь заблокирован."
}
```

---

#### GET `/api/friends/blocked`

Получение списка заблокированных пользователей.

**Требуется:** Аутентификация

**Ответ (200):**

```json
[
    {
        "id": 1,
        "username": "string",
        "profilePicture": "string",
        "tag": "string"
    }
]
```

---

### Roles (Роли)

#### GET `/api/servers/:serverId/roles`

Получение списка ролей сервера.

**Требуется:** Аутентификация

**Ответ (200):**

```json
[
    {
        "id": 1,
        "name": "string",
        "color": "#FF0000",
        "permissions": "0",
        "position": 1,
        "isHoisted": false,
        "isMentionable": true,
        "serverId": 1
    }
]
```

---

#### POST `/api/servers/:serverId/roles`

Создание новой роли.

**Требуется:** Аутентификация, права управления ролями

**Тело запроса:**

```json
{
    "name": "string",
    "color": "#FF0000",
    "permissions": 0,
    "position": 1,
    "isHoisted": false,
    "isMentionable": true
}
```

**Ответ (201):**

```json
{
    "id": 1,
    "name": "string",
    "color": "#FF0000",
    "permissions": "0",
    "position": 1,
    "isHoisted": false,
    "isMentionable": true,
    "serverId": 1
}
```

---

#### PATCH `/api/servers/:serverId/roles/:roleId`

Обновление роли.

**Требуется:** Аутентификация, права управления ролями

**Тело запроса:**

```json
{
    "name": "string",
    "color": "#FF0000",
    "permissions": 0,
    "position": 1,
    "isHoisted": false,
    "isMentionable": true
}
```

**Ошибки:**

- `403` - Нельзя управлять ролью выше или равной вашей

---

#### DELETE `/api/servers/:serverId/roles/:roleId`

Удаление роли.

**Требуется:** Аутентификация, права управления ролями

**Ошибки:**

- `400` - Нельзя удалить роль @everyone
- `403` - Нельзя удалить роль выше или равной вашей

**Ответ (204):** No Content

---

#### POST `/api/servers/:serverId/roles/members/:memberId/roles/:roleId`

Назначение роли участнику.

**Требуется:** Аутентификация, права управления ролями

**Ответ (201):**

```json
{
    "message": "Роль успешно назначена."
}
```

---

#### DELETE `/api/servers/:serverId/roles/members/:memberId/roles/:roleId`

Снятие роли с участника.

**Требуется:** Аутентификация, права управления ролями

**Ответ (204):** No Content

---

### Admin (Административная панель)

Все эндпоинты требуют прав администратора или модератора.

#### GET `/api/admin/stats`

Получение статистики системы.

**Требуется:** Аутентификация, права администратора

**Ответ (200):**

```json
{
    "users": {
        "total": 100,
        "active": 95,
        "blocked": 5,
        "byRole": {
            "admin": 2,
            "moderator": 5,
            "user": 93
        }
    },
    "servers": {
        "total": 50,
        "active": 48,
        "blocked": 2,
        "withChannels": 45
    },
    "channels": {
        "total": 200,
        "text": 150,
        "voice": 50
    },
    "messages": {
        "total": 10000,
        "today": 500
    }
}
```

---

#### GET `/api/admin/users`

Получение списка пользователей с пагинацией.

**Требуется:** Аутентификация, права модератора

**Query параметры:**

- `page` (optional, default: 1)
- `limit` (optional, default: 20)
- `search` (optional) - Поиск по username или email
- `role` (optional) - Фильтр по роли: `user`, `moderator`, `admin`
- `status` (optional) - Фильтр по статусу: `active`, `blocked`

---

#### GET `/api/admin/users/:id`

Получение информации о пользователе.

**Требуется:** Аутентификация, права модератора

---

#### PUT `/api/admin/users/:id`

Обновление пользователя (роль, статус).

**Требуется:** Аутентификация, права администратора

**Тело запроса:**

```json
{
    "role": "moderator",
    "isActive": true
}
```

---

#### DELETE `/api/admin/users/:id`

Удаление пользователя.

**Требуется:** Аутентификация, права администратора

---

#### GET `/api/admin/servers`

Получение списка серверов.

**Требуется:** Аутентификация, права модератора

**Query параметры:**

- `page` (optional, default: 1)
- `limit` (optional, default: 20)
- `search` (optional) - Поиск по имени
- `status` (optional) - Фильтр по статусу: `active`, `blocked`

---

#### GET `/api/admin/servers/:id`

Получение информации о сервере.

**Требуется:** Аутентификация, права модератора

---

#### POST `/api/admin/servers/:id/block`

Блокировка сервера.

**Требуется:** Аутентификация, права администратора

**Тело запроса:**

```json
{
    "reason": "string (минимум 3 символа)"
}
```

---

#### POST `/api/admin/servers/:id/unblock`

Разблокировка сервера.

**Требуется:** Аутентификация, права администратора

---

#### DELETE `/api/admin/servers/:id`

Удаление сервера.

**Требуется:** Аутентификация, права администратора

---

#### GET `/api/admin/logs`

Получение логов системы.

**Требуется:** Аутентификация, права администратора

---

## WebSocket / WebRTC

### Подключение

Для работы с голосовыми каналами и WebRTC используется Socket.IO. Подключение к серверу:

```javascript
const socket = io('http://localhost:5000/socket', {
    auth: {
        token: 'your_jwt_token'
    }
});
```

### События клиента

#### `join-room`

Присоединение к голосовой комнате (каналу).

**Параметры:**
- `roomId` (string, required) - ID комнаты (обычно соответствует ID голосового канала)
- `token` (string, required) - JWT токен для аутентификации

**Пример:**

```javascript
socket.emit('join-room', 'channel-123', 'your_jwt_token');
```

**Ответные события от сервера:**

- `created` - Отправляется подключившемуся пользователю с информацией о комнате
- `user-connected` - Отправляется всем остальным участникам комнаты

---

#### `leave-room`

Выход из голосовой комнаты.

**Параметры:**
- `roomId` (string, required) - ID комнаты

**Пример:**

```javascript
socket.emit('leave-room', 'channel-123');
```

---

#### `signal`

Отправка WebRTC сигналов (SDP offer/answer, ICE candidates) другому участнику.

**Параметры:**
- `to` (string, required) - Socket ID получателя
- `type` (string, required) - Тип сигнала (`offer`, `answer`, `candidate`)
- `sdp` (string, optional) - SDP описание (для offer/answer)
- `candidate` (object, optional) - ICE кандидат

**Пример (offer):**

```javascript
socket.emit('signal', {
    to: 'target_socket_id',
    type: 'offer',
    sdp: 'v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\n...'
});
```

**Пример (answer):**

```javascript
socket.emit('signal', {
    to: 'source_socket_id',
    type: 'answer',
    sdp: 'v=0\r\no=- 987654321 2 IN IP4 127.0.0.1\r\n...'
});
```

**Пример (ICE candidate):**

```javascript
socket.emit('signal', {
    to: 'target_socket_id',
    type: 'candidate',
    candidate: {
        candidate: 'candidate:1 1 UDP 2130706431 192.168.1.100 54400 typ host',
        sdpMid: '0',
        sdpMLineIndex: 0
    }
});
```

---

### События сервера

#### `created`

Отправляется пользователю при успешном присоединении к комнате. Содержит список всех участников комнаты.

**Данные:**

```json
{
    "roomId": "channel-123",
    "participants": [
        {
            "micToggle": true,
            "socketId": "socket_id_1",
            "userData": {
                "id": 1,
                "username": "user1",
                "profilePicture": "https://example.com/avatar1.png",
                "role": "user"
            }
        },
        {
            "micToggle": false,
            "socketId": "socket_id_2",
            "userData": {
                "id": 2,
                "username": "user2",
                "profilePicture": "https://example.com/avatar2.png",
                "role": "moderator"
            }
        }
    ]
}
```

**Обработка на клиенте:**

```javascript
socket.on('created', ({ roomId, participants }) => {
    console.log('Присоединился к комнате:', roomId);
    console.log('Участники:', participants);
    
    // Инициализация WebRTC соединений с каждым участником
    participants.forEach(participant => {
        if (participant.socketId !== socket.id) {
            createPeerConnection(participant.socketId, participant.userData);
        }
    });
});
```

---

#### `user-connected`

Отправляется всем участникам комнаты (кроме подключившегося) при появлении нового пользователя.

**Данные:**

```json
{
    "socketId": "new_socket_id",
    "userData": {
        "id": 3,
        "username": "newuser",
        "profilePicture": "https://example.com/avatar3.png",
        "role": "user"
    }
}
```

**Обработка на клиенте:**

```javascript
socket.on('user-connected', ({ socketId, userData }) => {
    console.log('Новый пользователь подключился:', userData.username);
    
    // Создание WebRTC соединения с новым участником
    createPeerConnection(socketId, userData);
});
```

---

#### `user-disconnected`

Отправляется всем участникам комнаты при отключении пользователя.

**Данные:**

```json
"socket_id_of_disconnected_user"
```

**Обработка на клиенте:**

```javascript
socket.on('user-disconnected', (socketId) => {
    console.log('Пользователь отключился:', socketId);
    
    // Закрытие WebRTC соединения
    closePeerConnection(socketId);
});
```

---

#### `signal`

Отправляется при получении WebRTC сигнала от другого участника.

**Данные:**

```json
{
    "from": "source_socket_id",
    "type": "offer",
    "sdp": "v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\n..."
}
```

**Обработка на клиенте:**

```javascript
socket.on('signal', async ({ from, type, sdp, candidate }) => {
    const peerConnection = getPeerConnection(from);
    
    if (type === 'offer') {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        socket.emit('signal', {
            to: from,
            type: 'answer',
            sdp: answer
        });
    } else if (type === 'answer') {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
    } else if (type === 'candidate') {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
});
```

---

#### `error`

Отправляется при возникновении ошибок.

**Данные:**

```json
{
    "message": "Failed to join room"
}
```

**Обработка на клиенте:**

```javascript
socket.on('error', (error) => {
    console.error('Socket ошибка:', error.message);
    alert(error.message);
});
```

---

### Полный пример клиента

```javascript
const socket = io('http://localhost:5000/socket', {
    auth: { token: 'your_jwt_token' }
});

const peerConnections = {};
const localStream = await navigator.mediaDevices.getUserMedia({ 
    audio: true, 
    video: false 
});

// Присоединение к комнате
function joinRoom(channelId) {
    socket.emit('join-room', channelId, 'your_jwt_token');
}

// Создание WebRTC соединения
function createPeerConnection(targetSocketId, userData) {
    const pc = new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
        ]
    });
    
    // Добавление локального потока
    localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
    });
    
    // Обработка ICE кандидатов
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('signal', {
                to: targetSocketId,
                type: 'candidate',
                candidate: event.candidate
            });
        }
    };
    
    // Обработка удаленного потока
    pc.ontrack = (event) => {
        const remoteAudio = new Audio();
        remoteAudio.srcObject = event.streams[0];
        remoteAudio.play();
    };
    
    // Создание offer для нового участника
    pc.onnegotiationneeded = async () => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        socket.emit('signal', {
            to: targetSocketId,
            type: 'offer',
            sdp: offer
        });
    };
    
    peerConnections[targetSocketId] = pc;
}

// Получение существующего соединения
function getPeerConnection(socketId) {
    return peerConnections[socketId];
}

// Закрытие соединения
function closePeerConnection(socketId) {
    const pc = peerConnections[socketId];
    if (pc) {
        pc.close();
        delete peerConnections[socketId];
    }
}

// Обработка событий сервера
socket.on('created', ({ roomId, participants }) => {
    participants.forEach(participant => {
        if (participant.socketId !== socket.id) {
            createPeerConnection(participant.socketId, participant.userData);
        }
    });
});

socket.on('user-connected', ({ socketId, userData }) => {
    createPeerConnection(socketId, userData);
});

socket.on('user-disconnected', (socketId) => {
    closePeerConnection(socketId);
});

socket.on('signal', async ({ from, type, sdp, candidate }) => {
    const pc = getPeerConnection(from);
    
    if (type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        socket.emit('signal', {
            to: from,
            type: 'answer',
            sdp: answer
        });
    } else if (type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    } else if (type === 'candidate') {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
});
```

---

## Коды ошибок

- `200` - Успешный запрос
- `201` - Ресурс успешно создан
- `204` - Успешный запрос без содержимого
- `400` - Неверный запрос (неверные параметры)
- `401` - Не авторизован (отсутствует или неверный токен)
- `403` - Доступ запрещен (недостаточно прав)
- `404` - Ресурс не найден
- `500` - Внутренняя ошибка сервера

## Примеры использования

### Регистрация и вход

```javascript
// Регистрация
const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
    }),
});

const { token } = await registerResponse.json();

// Вход
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
    }),
});

const { token: loginToken, user } = await loginResponse.json();
```

### Создание сервера и канала

```javascript
// Создание сервера
const serverResponse = await fetch('http://localhost:5000/api/servers', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
        name: 'My Server',
        description: 'Server description',
        icon: 'https://example.com/icon.png',
    }),
});

const server = await serverResponse.json();

// Создание канала
const channelResponse = await fetch(`http://localhost:5000/api/servers/${server.id}/channels`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
        name: 'general',
        type: 'text',
    }),
});

const channel = await channelResponse.json();
```

### Отправка сообщения

```javascript
const messageResponse = await fetch('http://localhost:5000/api/messages', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
        content: 'Hello, world!',
        channelId: channel.id,
    }),
});

const message = await messageResponse.json();
```

### Получение сообщений с пагинацией

```javascript
const messagesResponse = await fetch(
    `http://localhost:5000/api/messages?channelId=${channel.id}&page=1&limit=50`,
    {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
);

const { messages, total, page, totalPages } = await messagesResponse.json();
```

## Swagger UI

Интерактивная документация API доступна по адресу:

```
http://localhost:5000/api-docs
```

Для генерации документации выполните:

```bash
npm run docs-gen
```

## Примечания

- Все даты и время возвращаются в формате ISO 8601
- Все ID являются целыми числами
- Пароли должны быть минимум 8 символов (рекомендуется)
- JWT токены действительны в течение 7 дней
- Для работы с WebRTC используйте Socket.IO подключение по пути `/socket`
