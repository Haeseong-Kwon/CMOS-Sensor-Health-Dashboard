"use client";

import React, { useEffect, useState } from 'react';
import {
    Card,
    Table,
    TableHead,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    Text,
    Title,
    Badge,
    Button,
    TextInput,
    Dialog,
    DialogPanel
} from '@tremor/react';
import { supabase } from '@/lib/supabase';
import { SensorDevice } from '@/types/sensor';
import { Plus, Database, MapPin, Calendar, Cpu } from 'lucide-react';

export default function InventoryPage() {
    const [sensors, setSensors] = useState<SensorDevice[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSensors();
    }, []);

    const fetchSensors = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('sensor_devices')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching sensors:', error);
        if (data) setSensors(data);
        setLoading(false);
    };

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newSensor = {
            name: formData.get('name') as string,
            model: formData.get('model') as string,
            serial_number: formData.get('serial_number') as string,
            location: formData.get('location') as string,
            status: 'active',
            installation_date: new Date().toISOString().split('T')[0],
        };

        const { error } = await supabase
            .from('sensor_devices')
            .insert([newSensor]);

        if (error) {
            console.error('Error registering sensor:', error);
        } else {
            setIsDialogOpen(false);
            fetchSensors();
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Sensor Inventory</h1>
                    <p className="text-slate-400">Manage and track your optical sensor assets across all locations.</p>
                </div>
                <Button
                    icon={Plus}
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600 border-none shadow-lg shadow-orange-500/20"
                >
                    Register New Sensor
                </Button>
            </div>

            <Card className="bg-[#0f0f0f] border-slate-800/50">
                <Table className="mt-5">
                    <TableHead>
                        <TableRow className="border-slate-800">
                            <TableHeaderCell className="text-slate-400">Name</TableHeaderCell>
                            <TableHeaderCell className="text-slate-400">Model</TableHeaderCell>
                            <TableHeaderCell className="text-slate-400">Serial Number</TableHeaderCell>
                            <TableHeaderCell className="text-slate-400">Location</TableHeaderCell>
                            <TableHeaderCell className="text-slate-400">Status</TableHeaderCell>
                            <TableHeaderCell className="text-slate-400 text-right">Registered</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sensors.map((item) => (
                            <TableRow key={item.id} className="border-slate-800 hover:bg-white/5 transition-colors">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-800/50 rounded-lg">
                                            <Cpu size={16} className="text-orange-500" />
                                        </div>
                                        <Text className="text-white font-medium">{item.name}</Text>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Text className="text-slate-300">{item.model}</Text>
                                </TableCell>
                                <TableCell>
                                    <Text className="text-slate-400 font-mono text-xs">{item.serial_number}</Text>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <MapPin size={14} />
                                        <Text className="text-slate-400">{item.location}</Text>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge color={item.status === 'active' ? 'emerald' : 'amber'} className="bg-opacity-10">
                                        {item.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2 text-slate-500">
                                        <Calendar size={14} />
                                        <Text className="text-slate-500">{new Date(item.installation_date).toLocaleDateString()}</Text>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {sensors.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                                    No sensors found. Register your first device to begin monitoring.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} static={true}>
                <DialogPanel className="bg-[#0f0f0f] border border-slate-800/50 p-6 max-w-md w-full">
                    <Title className="text-white flex items-center gap-2">
                        <Database className="text-orange-500" size={20} />
                        Register Device
                    </Title>
                    <Text className="text-slate-400 mt-2 mb-6">Enter the technical specifications for the new CMOS sensor.</Text>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <Text className="text-slate-400 text-sm mb-1 ml-1 font-medium">Device Name</Text>
                            <TextInput name="name" placeholder="e.g. ALPHA-01" required className="bg-slate-900 border-slate-800" />
                        </div>
                        <div>
                            <Text className="text-slate-400 text-sm mb-1 ml-1 font-medium">Model Series</Text>
                            <TextInput name="model" placeholder="e.g. CMOS-X200" required className="bg-slate-900 border-slate-800" />
                        </div>
                        <div>
                            <Text className="text-slate-400 text-sm mb-1 ml-1 font-medium">Serial Number</Text>
                            <TextInput name="serial_number" placeholder="SN-XXXX-XXXX" required className="bg-slate-900 border-slate-800" />
                        </div>
                        <div>
                            <Text className="text-slate-400 text-sm mb-1 ml-1 font-medium">Deployment Location</Text>
                            <TextInput name="location" placeholder="e.g. Lab 4-A" required className="bg-slate-900 border-slate-800" />
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <Button variant="secondary" onClick={() => setIsDialogOpen(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-orange-500 hover:bg-orange-600 border-none px-8">
                                Confirm Registration
                            </Button>
                        </div>
                    </form>
                </DialogPanel>
            </Dialog>
        </div>
    );
}
