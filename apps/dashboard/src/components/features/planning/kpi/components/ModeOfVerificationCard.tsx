import { motion } from 'framer-motion'
import { ExternalLink, MoreHorizontal, Pencil, Plus, Trash } from 'lucide-react'
import { useState } from 'react'
import EditModeOfVerificationDialog from '../dialogs/EditModeOfVerificationDialog'
import AddModeOfVerificationDialog from '../dialogs/AddModeOfVerificationDialog'
import DeleteModeOfVerificationDialog from '../dialogs/DeleteModeOfVerificationDialog'
import { useKpiData } from '@/providers/KpiProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { isImageUrl, isVideoUrl } from '@/utils/media'

const cardVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
} 

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
}

const movVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  hover: { y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' },
}

export function ModeOfVerificationCard() {
  const kpi = useKpiData()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [movToDelete, setMovToDelete] = useState<string>('')
  const [editingMovId, setEditingMovId] = useState<string>('')

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="show"
    >
      <Card className="relative overflow-hidden border-l-4 border-l-emerald-400">
        <CardHeader>
          <motion.div
            variants={rowVariants}
            initial="hidden"
            animate="show"
            className="flex flex-row justify-between items-start"
          >
            <div>
              <CardTitle className="text-xl">Mode of Verification</CardTitle>
              <CardDescription className="mt-1">
                Evidence and verification methods for this KPI
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Mode
            </Button>
          </motion.div>
        </CardHeader>
        <CardContent>

        {/* MOV items */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
            className="space-y-4"
        >
          {kpi.KPIModeOfVerifications.length > 0 ? (
            kpi.KPIModeOfVerifications.map((mov) => (
              <motion.div
                key={mov.id}
                variants={movVariants}
                whileHover="hover"
              >
                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-lg">
                          {mov.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {mov.description}
                        </p>
                        {mov.url && (
                          <div className="mt-3">
                            {isImageUrl(mov.url) ? (
                              <div className="space-y-2">
                                <img
                                  src={mov.url}
                                  alt={mov.name}
                                  className="rounded-lg max-w-sm max-h-40 object-cover border border-border"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                                <a
                                  href={mov.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                                >
                                  Download Image
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            ) : isVideoUrl(mov.url) ? (
                              <div className="space-y-2">
                                <video
                                  controls
                                  className="rounded-lg max-w-sm max-h-80 border border-border"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                >
                                  <source src={mov.url} />
                                  Your browser does not support the video tag.
                                </video>
                                <a
                                  href={mov.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                                >
                                  Open Video
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            ) : (
                              <a
                                href={mov.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                              >
                                {mov.url}
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="Mode of Verification actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingMovId(mov.id)
                              setIsEditDialogOpen(true)
                            }}
                            className="gap-2 cursor-pointer"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {kpi.KPIModeOfVerifications.length > 1 && (
                            <DropdownMenuItem
                              onClick={() => {
                                setMovToDelete(mov.id)
                                setIsDeleteDialogOpen(true)
                              }}
                              className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.p
              variants={rowVariants}
                  className="text-sm text-muted-foreground py-8 text-center"
            >
              No verification methods defined
            </motion.p>
          )}
        </motion.div>
        </CardContent>

      <EditModeOfVerificationDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        movId={editingMovId}
      />

      <AddModeOfVerificationDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      <DeleteModeOfVerificationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        movId={movToDelete}
      />
      </Card>
    </motion.div>
  )
}
