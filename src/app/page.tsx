"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface CredentialProperty {
  name: string
  type: "text" | "select" | "date"
  options?: string[]
}

interface Credential {
  id: string
  name: string
  properties: CredentialProperty[]
}

interface User {
  id: string
  name: string
}

interface UserCredential {
  credentialId: string
  values: Record<string, string>
}

const initialUsers: User[] = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
  { id: "3", name: "Charlie" },
]

export default function Home() {
  const [users] = useState<User[]>(initialUsers)
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [assignments, setAssignments] = useState<Record<string, UserCredential[]>>({})

  // new credential dialog state
  const [credName, setCredName] = useState("")
  const [propList, setPropList] = useState<CredentialProperty[]>([
    { name: "", type: "text" },
  ])

  const addProp = () =>
    setPropList((prev) => [...prev, { name: "", type: "text" }])
  const updateProp = (idx: number, patch: Partial<CredentialProperty>) =>
    setPropList((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)))
  const removeProp = (idx: number) =>
    setPropList((prev) => prev.filter((_, i) => i !== idx))

  const createCredential = () => {
    if (!credName.trim()) return
    const cleanProps = propList
      .map((p) => ({
        ...p,
        name: p.name.trim(),
        options: p.type === "select" ? p.options?.filter(Boolean) : undefined,
      }))
      .filter((p) => p.name)
    const newCred: Credential = {
      id: Date.now().toString(),
      name: credName,
      properties: cleanProps,
    }
    setCredentials((prev) => [...prev, newCred])
    setCredName("")
    setPropList([{ name: "", type: "text" }])
  }

  // assign credential dialog state
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedCredId, setSelectedCredId] = useState("")
  const [valueFields, setValueFields] = useState<Record<string, string>>({})

  const assignCredential = () => {
    if (!selectedUser || !selectedCredId) return
    const cred = credentials.find((c) => c.id === selectedCredId)
    if (!cred) return
    const values: Record<string, string> = {}
    cred.properties.forEach((p) => {
      values[p.name] = valueFields[p.name] ?? ""
    })
    setAssignments((prev) => {
      const userCreds = prev[selectedUser.id] ?? []
      return {
        ...prev,
        [selectedUser.id]: [...userCreds, { credentialId: cred.id, values }],
      }
    })
    setSelectedUser(null)
    setSelectedCredId("")
    setValueFields({})
  }

  const credentialAssignedCount = (credId: string) => {
    return Object.values(assignments).filter((arr) =>
      arr.some((a) => a.credentialId === credId),
    ).length
  }

  return (
    <div className="container mx-auto space-y-10 p-6">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Credentials</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>New credential</Button>
            </DialogTrigger>
            <DialogContent className="space-y-4">
              <DialogHeader>
                <DialogTitle>New Credential</DialogTitle>
              </DialogHeader>
              <Input
                placeholder="Credential name"
                value={credName}
                onChange={(e) => setCredName(e.target.value)}
              />
              {propList.map((prop, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Property name"
                      value={prop.name}
                      onChange={(e) => updateProp(idx, { name: e.target.value })}
                    />
                    <select
                      className="rounded-md border p-2"
                      value={prop.type}
                      onChange={(e) =>
                        updateProp(idx, {
                          type: e.target.value as CredentialProperty["type"],
                        })
                      }
                    >
                      <option value="text">Text</option>
                      <option value="select">Select</option>
                      <option value="date">Date</option>
                    </select>
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => removeProp(idx)}
                    >
                      Remove
                    </Button>
                  </div>
                  {prop.type === "select" && (
                    <Input
                      placeholder="Options (comma separated)"
                      value={prop.options?.join(", ") || ""}
                      onChange={(e) =>
                        updateProp(idx, {
                          options: e.target.value
                            .split(/,/)
                            .map((o) => o.trim()),
                        })
                      }
                    />
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <Button type="button" onClick={addProp} variant="secondary">
                  Add property
                </Button>
                <Button type="button" onClick={createCredential}>
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Properties</TableHead>
              <TableHead className="text-right">Users</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {credentials.map((cred) => (
              <TableRow key={cred.id}>
                <TableCell>{cred.name}</TableCell>
                <TableCell>
                  {cred.properties
                    .map((p) => `${p.name} (${p.type})`)
                    .join(", ")}
                </TableCell>
                <TableCell className="text-right">
                  {credentialAssignedCount(cred.id)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      setCredentials((prev) =>
                        prev.filter((c) => c.id !== cred.id),
                      )
                    }
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Users</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Credentials</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell className="space-x-1">
                  {assignments[user.id]?.map((a, idx) => {
                    const cred = credentials.find((c) => c.id === a.credentialId)
                    if (!cred) return null
                    return (
                      <Dialog key={idx}>
                        <DialogTrigger asChild>
                          <Badge variant="secondary" className="cursor-pointer">
                            {cred.name}
                          </Badge>
                        </DialogTrigger>
                        <DialogContent className="space-y-2">
                          <DialogHeader>
                            <DialogTitle>{cred.name}</DialogTitle>
                          </DialogHeader>
                          {cred.properties.map((p) => (
                            <div key={p.name} className="text-sm">
                              <span className="font-medium mr-1">{p.name}:</span>
                              {a.values[p.name]}
                            </div>
                          ))}
                        </DialogContent>
                      </Dialog>
                    )
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Dialog
                    open={selectedUser?.id === user.id}
                    onOpenChange={(open) => {
                      if (open) {
                        setSelectedUser(user)
                      } else {
                        setSelectedUser(null)
                        setSelectedCredId("")
                        setValueFields({})
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm">Add credential</Button>
                    </DialogTrigger>
                    <DialogContent className="space-y-4">
                      <DialogHeader>
                        <DialogTitle>Assign Credential</DialogTitle>
                      </DialogHeader>
                      <select
                        className="w-full rounded-md border p-2"
                        value={selectedCredId}
                        onChange={(e) => {
                          setSelectedCredId(e.target.value)
                          setValueFields({})
                        }}
                      >
                        <option value="">Select credential</option>
                        {credentials.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      {credentials
                        .find((c) => c.id === selectedCredId)
                        ?.properties.map((prop) => {
                          const value = valueFields[prop.name] || ""
                          if (prop.type === "select") {
                            return (
                              <Select
                                key={prop.name}
                                value={value}
                                onValueChange={(val) =>
                                  setValueFields((v) => ({ ...v, [prop.name]: val }))
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder={prop.name} />
                                </SelectTrigger>
                                <SelectContent>
                                  {prop.options?.map((o) => (
                                    <SelectItem key={o} value={o}>
                                      {o}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )
                          }
                          if (prop.type === "date") {
                            const parsed = (() => {
                              const [d, m, y] = value.split("/")
                              if (!d || !m || !y) return undefined
                              const year = y.length === 2 ? Number(`20${y}`) : Number(y)
                              const date = new Date(year, Number(m) - 1, Number(d))
                              return isNaN(date.getTime()) ? undefined : date
                            })()
                            return (
                              <div key={prop.name} className="space-y-2">
                                <Input
                                  placeholder="dd/mm/yy"
                                  value={value}
                                  onChange={(e) =>
                                    setValueFields((v) => ({
                                      ...v,
                                      [prop.name]: e.target.value,
                                    }))
                                  }
                                />
                                <Calendar
                                  mode="single"
                                  selected={parsed}
                                  onSelect={(date) => {
                                    if (!date) return
                                    const d = String(date.getDate()).padStart(2, "0")
                                    const m = String(date.getMonth() + 1).padStart(2, "0")
                                    const y = String(date.getFullYear()).slice(-2)
                                    const formatted = `${d}/${m}/${y}`
                                    setValueFields((v) => ({
                                      ...v,
                                      [prop.name]: formatted,
                                    }))
                                  }}
                                />
                              </div>
                            )
                          }
                          return (
                            <Input
                              key={prop.name}
                              placeholder={prop.name}
                              value={value}
                              onChange={(e) =>
                                setValueFields((v) => ({
                                  ...v,
                                  [prop.name]: e.target.value,
                                }))
                              }
                            />
                          )
                        })}
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setSelectedUser(null)}
                        >
                          Cancel
                        </Button>
                        <Button type="button" onClick={assignCredential}>
                          Assign
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  )
}

