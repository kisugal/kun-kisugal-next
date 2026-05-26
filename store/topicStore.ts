import { create } from 'zustand'

export interface CreateTopicData {
  title: string
  content: string
  category: string
}

interface CreateTopicStore {
  data: CreateTopicData
  setData: (data: CreateTopicData) => void
  getData: () => CreateTopicData
  resetData: () => void
}

const initialData: CreateTopicData = {
  title: '',
  content: '',
  category: ''
}

export const useCreateTopicStore = create<CreateTopicStore>()((set, get) => ({
  data: initialData,
  setData: (data: CreateTopicData) => set({ data }),
  getData: () => get().data,
  resetData: () => set({ data: initialData })
}))
