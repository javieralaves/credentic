"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Property {
  key: string;
  value: string;
}

interface Credential {
  id: string;
  name: string;
  properties: Property[];
  assignedUserIds: string[];
}

interface User {
  id: string;
  name: string;
}

const initialUsers: User[] = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
  { id: "3", name: "Charlie" },
];

export default function Home() {
  const [users] = useState<User[]>(initialUsers);
  const [credentials, setCredentials] = useState<Credential[]>([]);

  const [name, setName] = useState("");
  const [propsList, setPropsList] = useState<Property[]>([
    { key: "", value: "" },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setPropsList([{ key: "", value: "" }]);
    setEditingId(null);
  };

  const addPropertyField = () => {
    setPropsList([...propsList, { key: "", value: "" }]);
  };

  const updateProp = (index: number, field: "key" | "value", value: string) => {
    setPropsList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeProp = (index: number) => {
    setPropsList((prev) => prev.filter((_, i) => i !== index));
  };

  const submitCredential = () => {
    if (!name.trim()) return;
    const cleanProps = propsList.filter((p) => p.key.trim());
    if (editingId) {
      setCredentials((prev) =>
        prev.map((c) =>
          c.id === editingId ? { ...c, name, properties: cleanProps } : c,
        ),
      );
    } else {
      const newCred: Credential = {
        id: Date.now().toString(),
        name,
        properties: cleanProps,
        assignedUserIds: [],
      };
      setCredentials((prev) => [...prev, newCred]);
    }
    resetForm();
  };

  const editCredential = (cred: Credential) => {
    setName(cred.name);
    setPropsList(
      cred.properties.length ? cred.properties : [{ key: "", value: "" }],
    );
    setEditingId(cred.id);
  };

  const deleteCredential = (id: string) => {
    setCredentials((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleAssignment = (credId: string, userId: string) => {
    setCredentials((prev) =>
      prev.map((c) =>
        c.id === credId
          ? {
              ...c,
              assignedUserIds: c.assignedUserIds.includes(userId)
                ? c.assignedUserIds.filter((u) => u !== userId)
                : [...c.assignedUserIds, userId],
            }
          : c,
      ),
    );
  };

  return (
    <div className="container mx-auto space-y-10 p-6">
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">Credentials</h1>
        <div className="rounded-md border p-4 space-y-4">
          <h2 className="font-semibold">
            {editingId ? "Edit Credential" : "New Credential"}
          </h2>
          <Input
            placeholder="Credential name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {propsList.map((prop, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                placeholder="Property key"
                value={prop.key}
                onChange={(e) => updateProp(idx, "key", e.target.value)}
              />
              <Input
                placeholder="Value"
                value={prop.value}
                onChange={(e) => updateProp(idx, "value", e.target.value)}
              />
              <Button type="button" onClick={() => removeProp(idx)}>
                Remove
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Button type="button" onClick={addPropertyField}>
              Add Property
            </Button>
            <Button type="button" onClick={submitCredential}>
              {editingId ? "Update" : "Create"}
            </Button>
            {editingId && (
              <Button type="button" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Properties</TableHeader>
              <TableHeader>Assigned Users</TableHeader>
              <TableHeader className="text-right">Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {credentials.map((cred) => (
              <TableRow key={cred.id}>
                <TableCell>{cred.name}</TableCell>
                <TableCell>
                  {cred.properties
                    .map((p) => `${p.key}: ${p.value}`)
                    .join(", ")}
                </TableCell>
                <TableCell>{cred.assignedUserIds.length}</TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button onClick={() => editCredential(cred)}>Edit</Button>
                  <Button onClick={() => deleteCredential(cred.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Assign Credentials to Users</h2>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>User</TableHeader>
              {credentials.map((cred) => (
                <TableHeader key={cred.id} className="text-center">
                  {cred.name}
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                {credentials.map((cred) => (
                  <TableCell key={cred.id} className="text-center">
                    <input
                      type="checkbox"
                      checked={cred.assignedUserIds.includes(user.id)}
                      onChange={() => toggleAssignment(cred.id, user.id)}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
