export { ColorPicker } from './ColorPicker'
export { FontFamilyPicker } from './FontFamilyPicker'
export { FontStylePicker } from './FontStylePicker'
export { FontWeightPicker } from './FontWeightPicker'
export { GatingInspector } from './gating/GatingInspector'
export { BasicViewInspector } from './BasicViewInspector'

export { Button } from '@/components/shadcn/Button'
export { Checkbox } from '@/components/shadcn/Checkbox'
export { Label } from '@/components/shadcn/Label'
export { Badge } from '@/components/shadcn/Badge'
export { Switch } from '@/components/shadcn/Switch'
export { Separator } from '@/components/shadcn/Separator'
export { Select } from '@/sdk/components/Select'
export { Slider } from '@/components/shadcn/Slider'
export { Textarea } from '@/components/shadcn/Textarea'
export { Input } from '@/components/shadcn/Input'
export { Toggle } from '@/components/shadcn/Toggle'

import * as IRadioGroup from '@/components/shadcn/RadioGroup'
export const RadioGroup = {
    Root: IRadioGroup.RadioGroup,
    Item: IRadioGroup.RadioGroupItem,
}
import * as IToggleGroup from '@/components/shadcn/ToggleGroup'
export const ToggleGroup = {
    Root: IToggleGroup.ToggleGroup,
    Item: IToggleGroup.ToggleGroupItem,
}
import * as ITabs from '@/components/shadcn/Tabs'
export const Tabs = {
    Root: ITabs.Tabs,
    List: ITabs.TabsList,
    Trigger: ITabs.TabsTrigger,
    Content: ITabs.TabsContent,
}
import * as IAlertDialog from '@/components/shadcn/AlertDialog'
export const AlertDialog = {
    Root: IAlertDialog.AlertDialog,
    Action: IAlertDialog.AlertDialogAction,
    Cancel: IAlertDialog.AlertDialogCancel,
    Content: IAlertDialog.AlertDialogContent,
    Description: IAlertDialog.AlertDialogDescription,
    Footer: IAlertDialog.AlertDialogFooter,
    Header: IAlertDialog.AlertDialogHeader,
    Title: IAlertDialog.AlertDialogTitle,
    Trigger: IAlertDialog.AlertDialogTrigger,
}
import * as ITable from '@/components/shadcn/Table'
export const Table = {
    Root: ITable.Table,
    Body: ITable.TableBody,
    Caption: ITable.TableCaption,
    Cell: ITable.TableCell,
    Head: ITable.TableHead,
    Header: ITable.TableHeader,
    Row: ITable.TableRow,
}
import * as IModal from '@/components/shadcn/Dialog'
export const Modal = {
    Root: IModal.Dialog,
    Content: IModal.DialogContent,
    Description: IModal.DialogDescription,
    Header: IModal.DialogHeader,
    Title: IModal.DialogTitle,
    Trigger: IModal.DialogTrigger,
    Portal: IModal.DialogPortal,
    Overlay: IModal.DialogOverlay,
    Close: IModal.DialogClose,
    Footer: IModal.DialogFooter,
}
import * as IAvatar from '@/components/shadcn/Avatar'
export const Avatar = {
    Root: IAvatar.Avatar,
    Image: IAvatar.AvatarImage,
    Fallback: IAvatar.AvatarFallback,
}
