
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { BriefcaseIcon, Bot, FileText, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AgencyPage() {
    const [contentAgentActive, setContentAgentActive] = useState(true);
    const [marketingAgentActive, setMarketingAgentActive] = useState(true);
    const [monthlyArticles, setMonthlyArticles] = useState([4]);
    const [monthlyBudget, setMonthlyBudget] = useState([500]);

    const handleSaveChanges = () => {
        // In a real application, this would save the settings to a database.
        // For this prototype, we'll just show a confirmation toast.
        toast.success("Autonomous Agent settings saved!", {
            description: "The AI agents will now operate based on your new configuration.",
        });
    };

    return (
      <div className="flex justify-center items-start p-4 pt-8">
        <Card className="w-full max-w-4xl shadow-2xl">
            <CardHeader className="text-center p-6 md:p-8">
                <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4">
                    <BriefcaseIcon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold">Autonomous Agency Control</CardTitle>
                <CardDescription className="text-md md:text-lg text-muted-foreground">
                    Configure and deploy your AI agents. Let the platform manage and grow itself.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
                
                {/* Content Agent Card */}
                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <FileText className="h-6 w-6 text-primary" />
                            Content Agent
                        </CardTitle>
                        <CardDescription>Manages SEO and autonomously writes and publishes articles to attract organic traffic.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                           <Label htmlFor="content-agent-switch" className="font-medium">Agent Status</Label>
                           <Switch
                             id="content-agent-switch"
                             checked={contentAgentActive}
                             onCheckedChange={setContentAgentActive}
                             aria-label="Toggle Content Agent"
                           />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="monthly-articles">Monthly Articles</Label>
                                <span className="text-sm font-bold text-primary">{monthlyArticles[0]}</span>
                            </div>
                            <Slider
                                id="monthly-articles"
                                min={1}
                                max={20}
                                step={1}
                                value={monthlyArticles}
                                onValueChange={setMonthlyArticles}
                                disabled={!contentAgentActive}
                            />
                        </div>
                    </CardContent>
                </Card>
                
                {/* Marketing Agent Card */}
                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Bot className="h-6 w-6 text-primary" />
                            Marketing Agent
                        </CardTitle>
                        <CardDescription>Manages paid advertising by creating and running campaigns to attract new customers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                           <Label htmlFor="marketing-agent-switch" className="font-medium">Agent Status</Label>
                           <Switch
                             id="marketing-agent-switch"
                             checked={marketingAgentActive}
                             onCheckedChange={setMarketingAgentActive}
                             aria-label="Toggle Marketing Agent"
                           />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="monthly-budget">Monthly Ad Budget</Label>
                                <span className="text-sm font-bold text-primary">${monthlyBudget[0]}</span>
                            </div>
                            <Slider
                                id="monthly-budget"
                                min={50}
                                max={5000}
                                step={10}
                                value={monthlyBudget}
                                onValueChange={setMonthlyBudget}
                                disabled={!marketingAgentActive}
                            />
                        </div>
                    </CardContent>
                </Card>

            </CardContent>
            <CardFooter className="p-6 md:p-8 border-t">
                <Button size="lg" className="w-full text-md md:text-lg" onClick={handleSaveChanges}>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Deploy & Automate
                </Button>
            </CardFooter>
        </Card>
      </div>
    );
}

    