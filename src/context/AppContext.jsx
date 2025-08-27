import React, { createContext, useContext, useReducer } from 'react'

const AppContext = createContext()

const initialState = {
  currentView: 'home', // 'home', 'document', 'teacher'
  currentDocument: null,
  documents: [],
  isLoading: false,
  error: null,
  uploadProgress: 0,
  chatSession: null,
  isTeacherMode: false
}

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_VIEW':
      return {
        ...state,
        currentView: action.payload
      }

    case 'SET_CURRENT_DOCUMENT':
      return {
        ...state,
        currentDocument: action.payload,
        currentView: 'document'
      }

    case 'SET_DOCUMENTS':
      return {
        ...state,
        documents: action.payload
      }

    case 'ADD_DOCUMENT':
      return {
        ...state,
        documents: [action.payload, ...state.documents]
      }

    case 'UPDATE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc.documentId === action.payload.documentId
            ? { ...doc, ...action.payload }
            : doc
        )
      }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      }

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }

    case 'SET_UPLOAD_PROGRESS':
      return {
        ...state,
        uploadProgress: action.payload
      }

    case 'SET_CHAT_SESSION':
      return {
        ...state,
        chatSession: action.payload
      }

    case 'TOGGLE_TEACHER_MODE':
      return {
        ...state,
        isTeacherMode: !state.isTeacherMode,
        currentView: state.isTeacherMode ? 'home' : 'teacher'
      }

    case 'RESET_STATE':
      return {
        ...initialState
      }

    default:
      return state
  }
}

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const actions = {
    setView: (view) => dispatch({ type: 'SET_VIEW', payload: view }),

    setCurrentDocument: (documentId) => dispatch({ type: 'SET_CURRENT_DOCUMENT', payload: documentId }),

    setDocuments: (documents) => dispatch({ type: 'SET_DOCUMENTS', payload: documents }),

    addDocument: (document) => dispatch({ type: 'ADD_DOCUMENT', payload: document }),

    updateDocument: (document) => dispatch({ type: 'UPDATE_DOCUMENT', payload: document }),

    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),

    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error }),

    clearError: () => dispatch({ type: 'CLEAR_ERROR' }),

    setUploadProgress: (progress) => dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: progress }),

    setChatSession: (session) => dispatch({ type: 'SET_CHAT_SESSION', payload: session }),

    toggleTeacherMode: () => dispatch({ type: 'TOGGLE_TEACHER_MODE' }),

    resetState: () => dispatch({ type: 'RESET_STATE' }),

    goHome: () => dispatch({ type: 'SET_VIEW', payload: 'home' })
  }

  return (
    <AppContext.Provider value={{ ...state, ...actions }}>
      {children}
    </AppContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}