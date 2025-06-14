"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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

interface Credential {
  id: string
  name: string
  properties: string[]
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
  const [propList, setPropList] = useState<string[]>([""])

  const addProp = () => setPropList((prev) => [...prev, ""])
  const updateProp = (idx: number, value: string) =>
    setPropList((prev) => prev.map((p, i) => (i === idx ? value : p)))
  const removeProp = (idx: number) =>
    setPropList((prev) => prev.filter((_, i) => i !== idx))

  const createCredential = () => {
    if (!credName.trim()) return
    const cleanProps = propList.map((p) => p.trim()).filter(Boolean)
    const newCred: Credential = {
      id: Date.now().toString(),
      name: credName,
      properties: cleanProps,
    }
    setCredentials((prev) => [...prev, newCred])
    setCredName("")
    setPropList([""])
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
      values[p] = valueFields[p] ?? ""
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
                <div key={idx} className="flex gap-2">
                  <Input
                    placeholder="Property name"
                    value={prop}
                    onChange={(e) => updateProp(idx, e.target.value)}
                  />
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => removeProp(idx)}
                  >
                    Remove
                  </Button>
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
                <TableCell>{cred.properties.join(", ")}</TableCell>
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
                            <div key={p} className="text-sm">
                              <span className="font-medium mr-1">{p}:</span>
                              {a.values[p]}
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
                        ?.properties.map((prop) => (
                          <Input
                            key={prop}
                            placeholder={prop}
                            value={valueFields[prop] || ""}
                            onChange={(e) =>
                              setValueFields((v) => ({
                                ...v,
                                [prop]: e.target.value,
                              }))
                            }
                          />
                        ))}
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

