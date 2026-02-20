"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel, Title, Text, Button, Flex } from '@tremor/react';
import { FileText, CheckCircle2, Loader2, Download } from 'lucide-react';

export default function ReportGenerationModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [step, setStep] = useState<'generating' | 'ready'>('generating');

    useEffect(() => {
        if (isOpen) {
            setStep('generating');
            const timer = setTimeout(() => {
                setStep('ready');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onClose={onClose} static={true}>
            <DialogPanel className="bg-[#0f0f0f] border border-slate-800 p-8 max-w-md w-full text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 mb-6">
                    {step === 'generating' ? (
                        <Loader2 className="animate-spin text-orange-500" size={32} />
                    ) : (
                        <FileText className="text-emerald-500" size={32} />
                    )}
                </div>

                <Title className="text-white text-xl">
                    {step === 'generating' ? 'Generating Diagnostic Report...' : 'Report Ready'}
                </Title>
                <Text className="text-slate-400 mt-2">
                    {step === 'generating'
                        ? 'Compiling sensor telemetry, defect maps, and yield statistics.'
                        : 'The comprehensive health analysis report has been generated successfully.'}
                </Text>

                {step === 'ready' && (
                    <div className="mt-8 space-y-3">
                        <div className="p-4 rounded-xl bg-white/5 border border-slate-800 flex items-center gap-3">
                            <div className="h-10 w-10 bg-red-500/10 flex items-center justify-center rounded text-red-500">
                                <span className="text-xs font-bold">PDF</span>
                            </div>
                            <div className="text-left flex-1">
                                <p className="text-white text-sm font-medium">CMOS_Health_Report_20260220.pdf</p>
                                <p className="text-slate-500 text-xs">2.4 MB • Generated just now</p>
                            </div>
                            <CheckCircle2 size={18} className="text-emerald-500" />
                        </div>

                        <Flex className="gap-3 mt-6">
                            <Button variant="secondary" className="w-full text-slate-400 border-slate-700 hover:text-white" onClick={onClose}>
                                Close
                            </Button>
                            <Button className="w-full bg-orange-500 hover:bg-orange-600 border-none flex items-center justify-center gap-2">
                                <Download size={16} />
                                Download
                            </Button>
                        </Flex>
                    </div>
                )}
            </DialogPanel>
        </Dialog>
    );
}
