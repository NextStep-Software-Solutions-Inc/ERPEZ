export type Project = {
  id: string
  projectName: string
  description?: string
}

export type ProjectDetails = Project & {
  description: string
}
