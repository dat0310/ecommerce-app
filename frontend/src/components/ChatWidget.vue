<template>
  <div class="chat-widget" :class="{ 'chat-open': isOpen, 'chat-embedded': embedded }">
    <!-- Chat Toggle Button -->
    <button v-if="!isOpen && !embedded" class="chat-toggle-btn" @click="openChat" id="chat-toggle-btn">
      <i class="bi bi-chat-dots-fill"></i>
      <span v-if="totalUnread > 0" class="chat-badge">{{ totalUnread > 99 ? '99+' : totalUnread }}</span>
    </button>

    <!-- Chat Panel -->
    <div v-if="isOpen" class="chat-panel">
      <!-- Header -->
      <div class="chat-header">
        <div class="d-flex align-items-center">
          <button v-if="activeConversation" class="btn btn-sm btn-link text-white p-0 me-2" @click="backToList">
            <i class="bi bi-arrow-left fs-5"></i>
          </button>
          <div>
            <h6 class="mb-0 text-white fw-bold">
              {{ activeConversation ? chatPartnerName : 'Messages' }}
            </h6>
            <small v-if="activeConversation && isPartnerTyping" class="text-white-50">
              <em>typing...</em>
            </small>
          </div>
        </div>
        <button class="btn btn-sm btn-link text-white p-0" @click="closeChat">
          <i class="bi bi-x-lg fs-5"></i>
        </button>
      </div>

      <!-- Conversation List -->
      <div v-if="!activeConversation" class="chat-body conversation-list">
        <div v-if="loadingConversations" class="text-center py-4">
          <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
          <p class="text-muted small mt-2">Loading conversations...</p>
        </div>
        <div v-else-if="conversations.length === 0" class="text-center py-5 px-3">
          <i class="bi bi-chat-square-text fs-1 text-muted"></i>
          <p class="text-muted mt-2 small">No conversations yet. Start chatting from a product page!</p>
        </div>
        <div
          v-for="conv in conversations"
          :key="conv._id"
          class="conversation-item"
          :class="{ 'has-unread': getUnreadCount(conv) > 0 }"
          @click="openConversation(conv)"
        >
          <div class="conv-avatar">
            <i class="bi bi-person-circle"></i>
          </div>
          <div class="conv-info">
            <div class="d-flex justify-content-between align-items-center">
              <strong class="conv-name">{{ getPartnerName(conv) }}</strong>
              <small class="text-muted">{{ formatTime(conv.lastMessage?.createdAt || conv.updatedAt) }}</small>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <p class="conv-last-msg text-muted mb-0">
                {{ conv.lastMessage?.text || 'No messages yet' }}
              </p>
              <span v-if="getUnreadCount(conv) > 0" class="unread-badge">
                {{ getUnreadCount(conv) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Context Card (pinned, outside scroll) -->
      <div v-if="showProductCard && currentProductContext && activeConversation" class="product-context-card">
        <div class="product-ctx-header">
          <span>You are communicating about this product.</span>
          <button class="btn-close-ctx" @click="showProductCard = false"><i class="bi bi-x"></i></button>
        </div>
        <div class="product-ctx-body">
          <img :src="currentProductContext.image" :alt="currentProductContext.name" class="product-ctx-img" @error="$event.target.src = 'https://via.placeholder.com/60'">
          <div class="product-ctx-info">
            <h6 class="product-ctx-name mb-0">{{ currentProductContext.name }}</h6>
            <span class="product-ctx-price">${{ currentProductContext.price }}</span>
          </div>
        </div>
      </div>

      <!-- Chat Messages -->
      <div v-if="activeConversation" class="chat-body messages-area" ref="messagesContainer" @scroll="handleScroll">
        <div v-if="loadingMessages" class="text-center py-3">
          <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
        </div>
        <div
          v-for="msg in messages"
          :key="msg._id"
          class="message-wrapper"
          :class="{ 'sent': msg.sender === currentUserId, 'received': msg.sender !== currentUserId }"
        >
          <!-- Inline Product Context Card (inside message) -->
          <div v-if="msg.productContext && msg.productContext.productId" class="msg-product-card" @click="goToProduct(msg.productContext.productId)">
            <img :src="msg.productContext.image" :alt="msg.productContext.name" class="msg-product-img" @error="$event.target.src = 'https://via.placeholder.com/60'">
            <div class="msg-product-info">
              <span class="msg-product-name">{{ msg.productContext.name }}</span>
              <span class="msg-product-price">${{ msg.productContext.price }}</span>
            </div>
            <i class="bi bi-chevron-right msg-product-arrow"></i>
          </div>
          <div class="message-bubble"
            :class="{ 'sent': msg.sender === currentUserId, 'received': msg.sender !== currentUserId }"
            v-if="msg.text || (msg.attachments && msg.attachments.length > 0)"
          >
            <!-- Attachments -->
            <div v-if="msg.attachments && msg.attachments.length > 0" class="message-attachments">
              <div v-for="(att, i) in msg.attachments" :key="i" class="attachment-item">
                <img
                  v-if="isImage(att.mimeType)"
                  :src="getAttachmentUrl(att.url)"
                  :alt="att.originalName"
                  class="attachment-image"
                  @click="openImagePreview(getAttachmentUrl(att.url))"
                >
                <a
                  v-else
                  :href="getAttachmentUrl(att.url)"
                  target="_blank"
                  class="attachment-file"
                >
                  <i class="bi bi-file-earmark me-1"></i>
                  {{ att.originalName }}
                  <small class="text-muted ms-1">({{ formatFileSize(att.size) }})</small>
                </a>
              </div>
            </div>
            <p v-if="msg.text" class="message-text mb-0">{{ msg.text }}</p>
            <small class="message-time">{{ formatTime(msg.createdAt) }}</small>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div v-if="activeConversation" class="chat-footer">
        <!-- File Preview -->
        <div v-if="selectedFiles.length > 0" class="file-preview-bar">
          <div v-for="(file, i) in selectedFiles" :key="i" class="file-preview-item">
            <img v-if="file.type.startsWith('image/')" :src="file.preview" class="preview-thumb" :alt="file.name">
            <span v-else class="preview-file-icon"><i class="bi bi-file-earmark"></i></span>
            <span class="preview-name">{{ file.name }}</span>
            <button class="btn-remove-file" @click="removeFile(i)"><i class="bi bi-x"></i></button>
          </div>
        </div>
        <div class="input-row">
          <button class="btn btn-sm btn-link text-muted p-0 me-2" @click="triggerFileInput" title="Attach file">
            <i class="bi bi-paperclip fs-5"></i>
          </button>
          <input
            ref="fileInput"
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
            class="d-none"
            @change="handleFileSelect"
          >
          <input
            v-model="newMessage"
            type="text"
            class="chat-input"
            placeholder="Type a message..."
            @keyup.enter="sendMessage"
            @input="handleTyping"
          >
          <button class="btn-send" @click="sendMessage" :disabled="!canSend">
            <i class="bi bi-send-fill"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Image Preview Modal -->
    <div v-if="previewImage" class="image-preview-overlay" @click="previewImage = null">
      <img :src="previewImage" alt="Preview" class="preview-full-image">
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import axios from 'axios'
import { io } from 'socket.io-client'

const props = defineProps({
  sellerId: { type: String, default: null },
  sellerName: { type: String, default: 'Seller' },
  embedded: { type: Boolean, default: false },
  productContext: { type: Object, default: null }
})

const store = useStore()
const router = useRouter()
const toast = useToast()

const isOpen = ref(false)
const socket = ref(null)
const conversations = ref([])
const activeConversation = ref(null)
const messages = ref([])
const newMessage = ref('')
const selectedFiles = ref([])
const loadingConversations = ref(false)
const loadingMessages = ref(false)
const isPartnerTyping = ref(false)
const typingTimeout = ref(null)
const previewImage = ref(null)
const totalUnread = ref(0)
const showProductCard = ref(true)
const currentProductContext = ref(null)

const messagesContainer = ref(null)
const fileInput = ref(null)

const currentUserId = computed(() => store.getters.currentUser?.id || store.getters.currentUser?._id)
const isAuthenticated = computed(() => store.getters.isAuthenticated)

const canSend = computed(() => {
  return (newMessage.value.trim() || selectedFiles.value.length > 0) && !loadingMessages.value
})

const chatPartnerName = computed(() => {
  if (!activeConversation.value) return ''
  return getPartnerName(activeConversation.value)
})

watch(isAuthenticated, (val) => {
  if (val) connectSocket()
  else disconnectSocket()
})

watch(() => props.productContext, (val) => {
  if (val) {
    currentProductContext.value = val
    showProductCard.value = true
  }
})

const connectSocket = () => {
  if (socket.value) return
  const token = localStorage.getItem('token')
  if (!token) return

  const baseURL = axios.defaults.baseURL || 'http://localhost:3000'
  socket.value = io(baseURL, {
    auth: { token },
    transports: ['websocket', 'polling']
  })

  socket.value.on('connect', () => {
    console.log('Chat socket connected')
    socket.value.emit('joinConversations')
  })

  socket.value.on('receiveMessage', (message) => {
    if (activeConversation.value && message.conversationId === activeConversation.value._id) {
      messages.value.push(message)
      nextTick(() => scrollToBottom())
    }
    fetchConversations()
  })

  socket.value.on('conversationUpdated', () => {
    fetchConversations()
  })

  socket.value.on('userTyping', ({ conversationId }) => {
    if (activeConversation.value && conversationId === activeConversation.value._id) {
      isPartnerTyping.value = true
    }
  })

  socket.value.on('userStopTyping', ({ conversationId }) => {
    if (activeConversation.value && conversationId === activeConversation.value._id) {
      isPartnerTyping.value = false
    }
  })

  socket.value.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message)
  })
}

const disconnectSocket = () => {
  if (socket.value) {
    socket.value.disconnect()
    socket.value = null
  }
}

const fetchConversations = async () => {
  loadingConversations.value = true
  try {
    const res = await axios.get('/api/chat/conversations')
    conversations.value = res.data
    calculateTotalUnread()
  } catch (err) {
    console.error('Error fetching conversations:', err)
  } finally {
    loadingConversations.value = false
  }
}

const calculateTotalUnread = () => {
  totalUnread.value = conversations.value.reduce((sum, conv) => {
    return sum + getUnreadCount(conv)
  }, 0)
}

const startConversationWith = async (sellerId, sellerName) => {
  try {
    const res = await axios.post('/api/chat/conversations', { sellerId, sellerName })
    activeConversation.value = res.data
    if (socket.value) {
      socket.value.emit('joinRoom', res.data._id)
    }
    await fetchMessages()
  } catch (err) {
    console.error('Error starting conversation:', err)
  }
}

const openChat = async () => {
  if (!isAuthenticated.value) {
    toast.error('Please log in to use chat.')
    router.push('/login')
    return
  }
  isOpen.value = true

  if (props.sellerId) {
    await startConversationWith(props.sellerId, props.sellerName)
    if (currentProductContext.value) {
      showProductCard.value = true
    }
  } else {
    await fetchConversations()
  }
}

const closeChat = () => {
  isOpen.value = false
  activeConversation.value = null
  messages.value = []
  currentProductContext.value = null
}

const backToList = () => {
  activeConversation.value = null
  messages.value = []
  currentProductContext.value = null
  fetchConversations()
}

const openConversation = async (conv) => {
  activeConversation.value = conv
  if (socket.value) {
    socket.value.emit('joinRoom', conv._id)
  }
  await fetchMessages()
}

const fetchMessages = async () => {
  if (!activeConversation.value) return
  loadingMessages.value = true
  try {
    const res = await axios.get(`/api/chat/conversations/${activeConversation.value._id}/messages`)
    messages.value = res.data.messages || []
    nextTick(() => scrollToBottom())
    fetchConversations()
  } catch (err) {
    console.error('Error fetching messages:', err)
  } finally {
    loadingMessages.value = false
  }
}

const uploadFiles = async () => {
  const formData = new FormData()
  selectedFiles.value.forEach(f => formData.append('files', f.raw))

  try {
    const res = await axios.post('/api/chat/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data.attachments
  } catch (err) {
    console.error('Upload error:', err)
    toast.error('Failed to upload files.')
    return null
  }
}

const sendMessage = async () => {
  if (!canSend.value || !activeConversation.value) return

  let attachments = []

  if (selectedFiles.value.length > 0) {
    attachments = await uploadFiles()
    if (!attachments) return
  }

  const messageType = attachments.length > 0
    ? (attachments.some(a => a.mimeType?.startsWith('image/')) ? 'image' : 'file')
    : 'text'

  const payload = {
    conversationId: activeConversation.value._id,
    text: newMessage.value.trim(),
    messageType,
    attachments
  }

  // Attach product context to this message if one is active
  if (currentProductContext.value) {
    payload.productContext = { ...currentProductContext.value }
    // Clear product context after attaching to the first sent message
    currentProductContext.value = null
    showProductCard.value = false
  }

  socket.value.emit('sendMessage', payload)

  newMessage.value = ''
  selectedFiles.value = []
  socket.value.emit('stopTyping', { conversationId: activeConversation.value._id })
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  files.forEach(file => {
    const item = { raw: file, name: file.name, type: file.type, preview: null }
    if (file.type.startsWith('image/')) {
      item.preview = URL.createObjectURL(file)
    }
    selectedFiles.value.push(item)
  })
  event.target.value = ''
}

const removeFile = (index) => {
  const file = selectedFiles.value[index]
  if (file.preview) URL.revokeObjectURL(file.preview)
  selectedFiles.value.splice(index, 1)
}

const handleTyping = () => {
  if (!activeConversation.value || !socket.value) return
  const currentConvId = activeConversation.value._id
  socket.value.emit('typing', { conversationId: currentConvId })
  clearTimeout(typingTimeout.value)
  typingTimeout.value = setTimeout(() => {
    if (socket.value) {
      socket.value.emit('stopTyping', { conversationId: currentConvId })
    }
  }, 2000)
}

const getPartnerName = (conv) => {
  if (!conv.participants) return 'Unknown'
  const partner = conv.participants.find(p => p.userId !== currentUserId.value)
  return partner?.name || 'Unknown'
}

const getUnreadCount = (conv) => {
  if (!conv.unreadCount) return 0
  return conv.unreadCount[currentUserId.value] || 0
}

const getAttachmentUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const base = axios.defaults.baseURL || 'http://localhost:3000'
  return `${base}/chat-uploads${url.replace('/uploads', '')}`
}

const isImage = (mimeType) => {
  return mimeType && mimeType.startsWith('image/')
}

const openImagePreview = (url) => {
  previewImage.value = url
}

const scrollToBottom = () => {
  const container = messagesContainer.value
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

const handleScroll = () => {
  // Future: infinite scroll for older messages
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return 'now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / 1048576).toFixed(1) + 'MB'
}

const goToProduct = (productId) => {
  if (productId) {
    window.open(`/products/${productId}`, '_blank')
  }
}

onMounted(() => {
  if (props.productContext) {
    currentProductContext.value = props.productContext
  }
  if (isAuthenticated.value) {
    connectSocket()
  }
  if (props.embedded) {
    openChat()
  }
})

onBeforeUnmount(() => {
  disconnectSocket()
})

defineExpose({
  currentProductContext,
  showProductCard,
  isOpen,
  startConversationWith
})
</script>

<style scoped>
.chat-widget {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  font-family: 'Inter', -apple-system, sans-serif;
}

.chat-toggle-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-toggle-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5);
}

.chat-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  border: 2px solid white;
}

.chat-panel {
  width: 380px;
  height: 520px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  background: #f8f9fc;
}

/* Conversation List */
.conversation-list {
  padding: 0;
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f0f0f4;
}

.conversation-item:hover {
  background: #f0f2ff;
}

.conversation-item.has-unread {
  background: #f5f3ff;
}

.conv-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.3rem;
  flex-shrink: 0;
  margin-right: 12px;
}

.conv-info {
  flex: 1;
  min-width: 0;
}

.conv-name {
  font-size: 0.9rem;
  color: #1a1a2e;
}

.conv-last-msg {
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.unread-badge {
  background: #667eea;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  flex-shrink: 0;
}

/* Messages */
.messages-area {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-wrapper {
  max-width: 80%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-wrapper.sent {
  align-self: flex-end;
  align-items: flex-end;
}

.message-wrapper.received {
  align-self: flex-start;
  align-items: flex-start;
}

/* Inline Product Card in Message */
.msg-product-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #e8e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  max-width: 280px;
}

.msg-product-card:hover {
  background: #f5f6ff;
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
}

.msg-product-img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.msg-product-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.msg-product-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #1a1a2e;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

.msg-product-price {
  font-size: 0.78rem;
  font-weight: 700;
  color: #ef4444;
}

.msg-product-arrow {
  color: #999;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.message-bubble {
  max-width: 100%;
  padding: 10px 14px;
  border-radius: 16px;
  position: relative;
  word-wrap: break-word;
}

.message-bubble.sent {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.message-bubble.received {
  background: white;
  color: #1a1a2e;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.message-text {
  font-size: 0.875rem;
  line-height: 1.4;
}

.message-time {
  display: block;
  font-size: 0.65rem;
  opacity: 0.7;
  margin-top: 4px;
  text-align: right;
}

.message-attachments {
  margin-bottom: 6px;
}

.attachment-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.attachment-image:hover {
  transform: scale(1.02);
}

.attachment-file {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: inherit;
  text-decoration: none;
  font-size: 0.8rem;
}

.received .attachment-file {
  background: #f0f2ff;
  color: #667eea;
}

/* Footer */
.chat-footer {
  border-top: 1px solid #f0f0f4;
  background: white;
  flex-shrink: 0;
}

.file-preview-bar {
  display: flex;
  gap: 8px;
  padding: 8px 16px;
  overflow-x: auto;
  background: #f8f9fc;
  border-bottom: 1px solid #f0f0f4;
}

.file-preview-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: white;
  border-radius: 8px;
  font-size: 0.75rem;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.preview-thumb {
  width: 28px;
  height: 28px;
  object-fit: cover;
  border-radius: 4px;
}

.preview-file-icon {
  font-size: 1.2rem;
  color: #667eea;
}

.preview-name {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-remove-file {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0;
  font-size: 1rem;
  line-height: 1;
}

.input-row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
}

.chat-input {
  flex: 1;
  border: 1px solid #e5e5ef;
  border-radius: 24px;
  padding: 10px 16px;
  font-size: 0.875rem;
  outline: none;
  background: #f8f9fc;
  transition: all 0.2s;
}

.chat-input:focus {
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-send {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  margin-left: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-send:hover:not(:disabled) {
  transform: scale(1.1);
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Product Context Card (Shopee style) */
.product-context-card {
  margin: 0;
  background: white;
  border-radius: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid #e8e8f0;
  overflow: hidden;
  flex-shrink: 0;
}

.product-ctx-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fc;
  border-bottom: 1px solid #f0f0f4;
  font-size: 0.75rem;
  color: #666;
}

.btn-close-ctx {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0;
  font-size: 1.1rem;
  line-height: 1;
  transition: color 0.2s;
}

.btn-close-ctx:hover {
  color: #333;
}

.product-ctx-body {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
}

.product-ctx-img {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.product-ctx-info {
  flex: 1;
  min-width: 0;
}

.product-ctx-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: #1a1a2e;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

.product-ctx-price {
  font-size: 0.8rem;
  font-weight: 700;
  color: #ef4444;
}

/* Image Preview Modal */
.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  cursor: pointer;
}

.preview-full-image {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

/* Scrollbar */
.chat-body::-webkit-scrollbar {
  width: 4px;
}

.chat-body::-webkit-scrollbar-track {
  background: transparent;
}

.chat-body::-webkit-scrollbar-thumb {
  background: #d0d0dd;
  border-radius: 2px;
}

/* Embedded mode (inside SellerDashboard) */
.chat-embedded {
  position: relative;
  bottom: auto;
  right: auto;
  width: 100%;
  height: 100%;
}

.chat-embedded .chat-panel {
  width: 100%;
  height: 100%;
  border-radius: 0;
  box-shadow: none;
  animation: none;
}

/* Mobile */
@media (max-width: 480px) {
  .chat-panel {
    width: calc(100vw - 16px);
    height: calc(100vh - 100px);
    bottom: 8px;
    right: 8px;
    position: fixed;
  }
}
</style>
