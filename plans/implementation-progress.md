# ProjectVoice API Implementation Progress

## Обзор проекта
Полная реализация REST API для ProjectVoice - голосового приложения с поддержкой WebRTC на NestJS.

## Статус реализации

### Фаза 1: Базовая инфраструктура
- [ ] Установка необходимых зависимостей
- [ ] Настройка TypeORM и базы данных
- [ ] Настройка JWT аутентификации
- [ ] Настройка Socket.IO для WebRTC
- [ ] Создание базовых DTO и сущностей

### Фаза 2: Auth (Аутентификация)
- [ ] POST /api/auth/register - регистрация пользователя
- [ ] POST /api/auth/login - вход в систему
- [ ] GET /api/auth/me - получение текущего пользователя

### Фаза 3: Users (Пользователи)
- [ ] GET /api/users/ - текущий пользователь
- [ ] GET /api/users/:id - пользователь по ID
- [ ] PUT /api/users/ - обновление профиля
- [ ] DELETE /api/users/ - удаление аккаунта

### Фаза 4: Servers (Серверы)
- [ ] GET /api/servers - список серверов
- [ ] POST /api/servers - создание сервера
- [ ] GET /api/servers/:id - сервер по ID
- [ ] PUT /api/servers/:id - обновление сервера
- [ ] DELETE /api/servers/:id - удаление сервера

### Фаза 5: Channels (Каналы)
- [ ] GET /api/servers/:serverId/channels - список каналов
- [ ] POST /api/servers/:serverId/channels - создание канала
- [ ] GET /api/servers/:serverId/channels/:channelId - канал по ID
- [ ] PUT /api/servers/:serverId/channels/:channelId - обновление канала
- [ ] DELETE /api/servers/:serverId/channels/:channelId - удаление канала

### Фаза 6: Messages (Сообщения)
- [ ] GET /api/messages - сообщения с пагинацией
- [ ] POST /api/messages - создание сообщения
- [ ] PUT /api/messages/:id - обновление сообщения
- [ ] DELETE /api/messages/:id - удаление сообщения
- [ ] GET /api/messages/search - поиск сообщений

### Фаза 7: ServerMembers (Участники серверов)
- [ ] GET /api/serverMembers/:serverId/members - список участников
- [ ] POST /api/serverMembers/:serverId/members - добавление участника
- [ ] PUT /api/serverMembers/:serverId/members/:memberId - обновление роли
- [ ] DELETE /api/serverMembers/:serverId/members/:memberId - удаление участника
- [ ] POST /api/serverMembers/:serverId/owner - назначение владельца

### Фаза 8: Invites (Приглашения)
- [ ] POST /api/invite/:serverId/invite - создание приглашения
- [ ] GET /api/invite/invite/:token - информация о приглашении
- [ ] POST /api/invite/invite/:token/accept - принятие приглашения
- [ ] GET /api/invite/:serverId/invites - список приглашений
- [ ] DELETE /api/invite/:inviteId - удаление приглашения

### Фаза 9: Friends (Друзья)
- [ ] GET /api/friends - список друзей
- [ ] GET /api/friends/requests - запросы в друзья
- [ ] POST /api/friends/request - отправка запроса
- [ ] POST /api/friends/accept/:requestId - принятие запроса
- [ ] DELETE /api/friends/:id - удаление друга
- [ ] POST /api/friends/block/:targetUserId - блокировка
- [ ] GET /api/friends/blocked - список заблокированных

### Фаза 10: Roles (Роли)
- [ ] GET /api/servers/:serverId/roles - список ролей
- [ ] POST /api/servers/:serverId/roles - создание роли
- [ ] PATCH /api/servers/:serverId/roles/:roleId - обновление роли
- [ ] DELETE /api/servers/:serverId/roles/:roleId - удаление роли
- [ ] POST /api/servers/:serverId/roles/members/:memberId/roles/:roleId - назначение роли
- [ ] DELETE /api/servers/:serverId/roles/members/:memberId/roles/:roleId - снятие роли

### Фаза 11: Admin (Административная панель)
- [ ] GET /api/admin/stats - статистика
- [ ] GET /api/admin/users - список пользователей
- [ ] GET /api/admin/users/:id - пользователь по ID
- [ ] PUT /api/admin/users/:id - обновление пользователя
- [ ] DELETE /api/admin/users/:id - удаление пользователя
- [ ] GET /api/admin/servers - список серверов
- [ ] GET /api/admin/servers/:id - сервер по ID
- [ ] POST /api/admin/servers/:id/block - блокировка сервера
- [ ] POST /api/admin/servers/:id/unblock - разблокировка сервера
- [ ] DELETE /api/admin/servers/:id - удаление сервера
- [ ] GET /api/admin/logs - логи системы

### Фаза 12: WebSocket / WebRTC
- [ ] Настройка Socket.IO шлюза
- [ ] Обработка события join-room
- [ ] Обработка события leave-room
- [ ] Обработка события signal (WebRTC)
- [ ] Отправка события created
- [ ] Отправка события user-connected
- [ ] Отправка события user-disconnected
- [ ] Отправка события signal
- [ ] Отправка события error

### Фаза 13: Документация
- [ ] Настройка Swagger
- [ ] Добавление декораторов Swagger для всех эндпоинтов

---

## Детальный план реализации

### Шаг 1: Установка зависимостей
```bash
npm install @nestjs/typeorm typeorm pg sqlite3
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install class-validator class-transformer
npm install @nestjs/swagger swagger-ui-express
```

### Шаг 2: Настройка базы данных
Создать модуль базы данных с TypeORM и сущности для всех моделей.

### Шаг 3: Создание сущностей
- User
- Server
- Channel
- Message
- ServerMember
- Invite
- Friend
- Role
- UserRole (junction table)
- BlockedUser

### Шаг 4: Создание модулей
- AuthModule
- UsersModule
- ServersModule
- ChannelsModule
- MessagesModule
- ServerMembersModule
- InvitesModule
- FriendsModule
- RolesModule
- AdminModule
- GatewayModule (WebSocket)

### Шаг 5: Реализация контроллеров и сервисов для каждого модуля

---

## Текущий прогресс

### Реализовано:
- [x] Создан файл плана реализации

### В процессе:
- [ ] Установка зависимостей

### Ожидают реализации:
- Все остальные этапы

---

## Заметки
- Все эндпоинты требуют аутентификации через JWT токен
- Токен передается в заголовке Authorization: Bearer <token>
- WebSocket подключение по пути /socket
- Базовый URL: http://localhost:5000/api
- Swagger UI: http://localhost:5000/api-docs
