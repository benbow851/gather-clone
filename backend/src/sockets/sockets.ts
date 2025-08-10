import { Server } from 'socket.io'
import { JoinRealm, Disconnect, OnEventCallback, MovePlayer, Teleport, ChangedSkin, NewMessage } from './socket-types'
import { z } from 'zod'
import { supabase } from '../supabase'
import { users } from '../Users'
import { sessionManager } from '../session'
import { removeExtraSpaces } from '../utils'
import { kickPlayer } from './helpers'
import { formatEmailToName } from '../utils'

const joiningInProgress = new Set<string>()

function protectConnection(io: Server) {
    io.use(async (socket, next) => {
        const access_token = socket.handshake.headers['authorization']?.split(' ')[1]
        const uid = socket.handshake.query.uid as string
        const username = (socket.handshake.query.username as string) || 'Guest'
        const allowGuests = process.env.ALLOW_GUESTS === 'true'

        if (!access_token) {
            if (allowGuests && uid) {
                // create a synthetic user object compatible with downstream code
                users.addUser(uid, {
                    id: uid,
                    aud: 'guest',
                    role: 'guest',
                    email: `${username}@guest.local`,
                    email_confirmed_at: null,
                    phone: '',
                    confirmation_sent_at: null,
                    app_metadata: { provider: 'guest' },
                    user_metadata: { email: `${username}@guest.local`, name: username },
                    identities: [],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    factors: [],
                    is_anonymous: true
                } as any)
                return next()
            }
            const error = new Error('Invalid access token or uid.')
            return next(error)
        }
        if (!uid) {
            const error = new Error('Invalid access token or uid.')
            return next(error)
        }
        const { data: user, error } = await supabase.auth.getUser(access_token)
        if (error) {
            return next(new Error('Invalid access token.'))
        }
        if (!user || user.user.id !== uid) {
            return next(new Error('Invalid uid.'))
        }
        users.addUser(uid, user.user)
        next()
    })
}

export function sockets(io: Server) {
    protectConnection(io)

    // Handle a connection
    io.on('connection', (socket) => {
        console.log('🔌 Socket connected:', socket.id)

        // Space-related socket events (for the new spaces system)
        socket.on('join-space', (data) => {
            console.log('🚀 User joining space:', data)
            const { spaceId, user } = data
            if (!spaceId || !user) {
                console.log('❌ Invalid join-space data:', data)
                return
            }
            socket.join(spaceId)
            socket.to(spaceId).emit('user-joined-space', user)
            socket.emit('users-update', [user]) // For now, just the current user
            console.log('✅ User joined space:', spaceId, user.name)
        })

        socket.on('move-user', (data) => {
            console.log('🔄 User moving:', data)
            const { spaceId, userId, x, y } = data
            if (!spaceId || !userId) {
                console.log('❌ Invalid move-user data:', data)
                return
            }
            const movedUser = { id: userId, x, y }
            socket.to(spaceId).emit('user-moved', movedUser)
            console.log('✅ User moved in space:', spaceId, userId, x, y)
        })

        socket.on('send-message', (data) => {
            console.log('💬 User sending message:', data)
            const { spaceId, userId, userName, message, timestamp } = data
            if (!spaceId || !message || !userName) {
                console.log('❌ Invalid send-message data:', data)
                return
            }
            const messageData = { userId, userName, message, timestamp }
            io.to(spaceId).emit('message', messageData)
            console.log('✅ Message sent in space:', spaceId, message)
        })

        socket.on('leave-space', (data) => {
            console.log('👋 User leaving space:', data)
            const { spaceId, user } = data
            if (!spaceId || !user) {
                console.log('❌ Invalid leave-space data:', data)
                return
            }
            socket.leave(spaceId)
            socket.to(spaceId).emit('user-left-space', user)
            console.log('✅ User left space:', spaceId, user.name)
        })

        socket.on('disconnect', () => {
            console.log('🔌 Socket disconnected:', socket.id)
        })

        function on(eventName: string, schema: z.ZodTypeAny, callback: OnEventCallback) {
            socket.on(eventName, (data: any) => {
                const success = schema.safeParse(data).success
                if (!success) return

                const session = sessionManager.getPlayerSession(socket.handshake.query.uid as string)
                if (!session) {
                    return
                }
                callback({ session, data })
            })
        }

        function emit(eventName: string, data: any) {
            const session = sessionManager.getPlayerSession(socket.handshake.query.uid as string)
            if (!session) {
                return
            }

            const room = session.getPlayerRoom(socket.handshake.query.uid as string)
            const players = session.getPlayersInRoom(room)

            for (const player of players) {
                if (player.socketId === socket.id) continue

                io.to(player.socketId).emit(eventName, data)
            }
        }

        function emitToSocketIds(socketIds: string[], eventName: string, data: any) {
            for (const socketId of socketIds) {
                io.to(socketId).emit(eventName, data)
            }
        }

        socket.on('joinRealm', async (realmData: z.infer<typeof JoinRealm>) => {
            const uid = socket.handshake.query.uid as string
            const rejectJoin = (reason: string) => {
                socket.emit('failedToJoinRoom', reason)
                joiningInProgress.delete(uid)
            }

            if (JoinRealm.safeParse(realmData).success === false) {
                return rejectJoin('Invalid request data.')
            }

            if (joiningInProgress.has(uid)) {
                rejectJoin('Already joining a space.')
            }
            joiningInProgress.add(uid)

            const session = sessionManager.getSession(realmData.realmId)
            if (session) {
                const playerCount = session.getPlayerCount()
                if (playerCount >= 30) {
                    return rejectJoin("Space is full. It's 30 players max.")
                } 
            }

            const { data, error } = await supabase.from('realms').select('owner_id, share_id, map_data, only_owner').eq('id', realmData.realmId).single()

            if (error || !data) {
                return rejectJoin('Space not found.')
            }

            // Resolve skin and username
            let skin = '009'
            let username = (socket.handshake.query.username as string) || 'Guest'
            const access_token = socket.handshake.headers['authorization']?.split(' ')[1]
            if (access_token) {
                const userId = uid
                const { data: profile } = await supabase.from('profiles').select('skin').eq('id', userId).single()
                if (profile && profile.skin) skin = profile.skin
                const user = users.getUser(userId)!
                username = formatEmailToName(user.user_metadata.email)
            }

            const realm = data

            const join = async () => {
                if (!sessionManager.getSession(realmData.realmId)) {
                    sessionManager.createSession(realmData.realmId, data.map_data)
                }

                const currentSession = sessionManager.getPlayerSession(uid)
                if (currentSession) {
                    kickPlayer(uid, 'You have logged in from another location.')
                }

                sessionManager.addPlayerToSession(socket.id, realmData.realmId, uid, username, skin)
                const newSession = sessionManager.getPlayerSession(uid)
                const player = newSession.getPlayer(uid)   

                socket.join(realmData.realmId)
                socket.emit('joinedRealm')
                emit('playerJoinedRoom', player)
                joiningInProgress.delete(uid)
            }

            if (realm.owner_id === socket.handshake.query.uid) {
                return join()
            }

            if (realm.only_owner) {
                return rejectJoin('This realm is private right now. Come back later!')
            }

            if (realm.share_id === realmData.shareId) {
                return join()
            } else {
                return rejectJoin('The share link has been changed.')
            }
        })

        // Handle a disconnection
        on('disconnect', Disconnect, ({ session, data }) => {
            const uid = socket.handshake.query.uid as string
            const socketIds = sessionManager.getSocketIdsInRoom(session.id, session.getPlayerRoom(uid))
            const success = sessionManager.logOutBySocketId(socket.id)
            if (success) {
                emitToSocketIds(socketIds, 'playerLeftRoom', uid)
                users.removeUser(uid)
            }
        })

        on('movePlayer', MovePlayer, ({ session, data }) => {  
            const player = session.getPlayer(socket.handshake.query.uid as string)
            const changedPlayers = session.movePlayer(player.uid, data.x, data.y)

            emit('playerMoved', {
                uid: player.uid,
                x: player.x,
                y: player.y
            })

            for (const uid of changedPlayers) {
                const changedPlayerData = session.getPlayer(uid)

                emitToSocketIds([changedPlayerData.socketId], 'proximityUpdate', {
                    proximityId: changedPlayerData.proximityId
                })
            }
        })  

        on('teleport', Teleport, ({ session, data }) => {
            const uid = socket.handshake.query.uid as string
            const player = session.getPlayer(uid)
            if (player.room !== data.roomIndex) {
                emit('playerLeftRoom', uid)
                const session = sessionManager.getPlayerSession(uid)
                const changedPlayers = session.changeRoom(uid, data.roomIndex, data.x, data.y)
                emit('playerJoinedRoom', player)

                for (const uid of changedPlayers) {
                    const changedPlayerData = session.getPlayer(uid)

                    emitToSocketIds([changedPlayerData.socketId], 'proximityUpdate', {
                        proximityId: changedPlayerData.proximityId
                    })
                }
            } else {
                const changedPlayers = session.movePlayer(player.uid, data.x, data.y)
                emit('playerTeleported', { uid, x: player.x, y: player.y })

                for (const uid of changedPlayers) {
                    const changedPlayerData = session.getPlayer(uid)

                    emitToSocketIds([changedPlayerData.socketId], 'proximityUpdate', {
                        proximityId: changedPlayerData.proximityId
                    })
                }
            }
        })

        on('changedSkin', ChangedSkin, ({ session, data }) => {
            const uid = socket.handshake.query.uid as string
            const player = session.getPlayer(uid)
            player.skin = data
            emit('playerChangedSkin', { uid, skin: player.skin })
        })

        on('sendMessage', NewMessage, ({ session, data }) => {
            // cannot exceed 300 characters
            if (data.length > 300 || data.trim() === '') return

            const message = removeExtraSpaces(data)

            const uid = socket.handshake.query.uid as string
            emit('receiveMessage', { uid, message })
        })

        // Space-related socket events
        socket.on('join-space', (data) => {
            const { spaceId, user } = data
            if (!spaceId || !user) return

            // Join the space room
            socket.join(spaceId)
            
            // Store user in the space (you can use a Map or database)
            // For now, we'll emit to all users in the space
            socket.to(spaceId).emit('user-joined-space', user)
            
            // Get current users in the space and emit update
            // This is a simplified version - you might want to track users per space
            socket.emit('users-update', [user])
        })

        socket.on('move-user', (data) => {
            const { spaceId, userId, x, y } = data
            if (!spaceId || !userId) return

            // Update user position and emit to all users in the space
            const movedUser = { id: userId, x, y }
            socket.to(spaceId).emit('user-moved', movedUser)
        })

        socket.on('send-message', (data) => {
            const { spaceId, userId, userName, message, timestamp } = data
            if (!spaceId || !message || !userName) return

            // Broadcast message to all users in the space
            const messageData = {
                userId,
                userName,
                message,
                timestamp
            }
            
            io.to(spaceId).emit('message', messageData)
        })

        socket.on('leave-space', (data) => {
            const { spaceId, user } = data
            if (!spaceId || !user) return

            // Leave the space room
            socket.leave(spaceId)
            
            // Notify other users in the space
            socket.to(spaceId).emit('user-left-space', user)
        })
    })
}