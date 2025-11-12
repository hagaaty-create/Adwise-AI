import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, ShieldCheck, Globe, InfinityIcon, BriefcaseIcon, BadgeCheck } from "lucide-react";

const agencyFeatures = [
    {
      icon: <InfinityIcon className="h-5 w-5 text-primary" />,
      text: "Unlimited ad accounts",
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-primary" />,
      text: "Accounts protected against random closure",
    },
    {
      icon: <Globe className="h-5 w-5 text-primary" />,
      text: "Target all countries with no spending limits",
    },
    {
      icon: <Star className="h-5 w-5 text-primary" />,
      text: "Priority customer support",
    },
    {
      icon: <BadgeCheck className="h-5 w-5 text-primary" />,
      text: "Official reliability certificates",
    },
];

const platforms = [
    { name: "Google Ads", icon: <svg role="img" viewBox="0 0 24 24" className="h-6 w-6"><path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.75 8.36,4.73 12.19,4.73C15.28,4.73 17.27,6.48 17.27,6.48L19.43,4.18C19.43,4.18 16.71,2.05 12.19,2.05C6.7,2.05 2.5,6.73 2.5,12C2.5,17.27 6.7,21.95 12.19,21.95C18.08,21.95 21.5,17.5 21.5,12.33C21.5,11.76 21.45,11.43 21.35,11.1Z"></path></svg>},
    { name: "Facebook Ads", icon: <svg role="img" viewBox="0 0 24 24" className="h-6 w-6"><path fill="currentColor" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>},
    { name: "TikTok Ads", icon: <svg role="img" viewBox="0 0 24 24" className="h-6 w-6"><path fill="currentColor" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.23.16 1.66.43.61 1.22.98 2.02.93.8-.04 1.56-.48 1.96-1.23.41-.75.24-1.87-.42-2.51v-4.1c-1.31.02-2.61.01-3.91.02-.08-1.53-.63-3.09-1.75-4.17-1.12-1.1-2.7-1.6-4.24-1.76V2.18c1.44.05 2.89.35 4.2.97.57.26 1.1.59 1.62.93.01-2.92-.01-5.84.02-8.75z"/></svg>},
    { name: "Snapchat Ads", icon: <svg role="img" viewBox="0 0 24 24" className="h-6 w-6"><path fill="currentColor" d="M2.7 10.3c0-2.3.9-4.4 2.5-6C6.7 2.7 8.8.9 11.1.9c2.6 0 4.5 1.1 5.9 3.3 1.2 1.9 1.9 4.1 1.9 6.7 0 2.8-1 5.3-3 7.1-1.2 1.1-2.6 1.8-4.1 2.1-1.5.3-3.1.2-4.6-.5-1-.3-1.9-.9-2.6-1.6-1.1-1.1-1.9-2.5-2.2-4-.3-1.8-.3-3.7 0-5.5m7.8 8.6c.3 0 .7.1.9.1 2.1 0 4-1.1 5.1-2.9.9-1.5 1.4-3.2 1.4-5 0-2.3-.6-4.2-1.8-5.7-1.4-1.8-3.3-2.8-5.6-2.8-2.4 0-4.4 1.1-5.8 3.3-.9 1.4-1.4 3-1.4 4.8 0 1.5.4 2.9 1.1 4.2.9 1.5 2.2 2.5 3.8 2.5.4 0 .9 0 1.2-.1M16 14.8c0 .2-.1.4-.2.5-.2.2-.4.4-.7.5-.2.1-.5.1-.7.1-.4 0-.8-.1-1.1-.3-.3-.2-.5-.4-.7-.7-.2-.3-.3-.6-.3-.9 0-.2.1-.4.2-.5.2-.2.4-.4.7-.5.2-.1.5-.1.7-.1.4 0 .8.1 1.1.3.3.2.5.4.7.7.2.3.3.6.3.9M8.3 14.8c0 .2-.1.4-.2.5-.2.2-.4.4-.7.5-.2.1-.5.1-.7.1-.4 0-.8-.1-1.1-.3-.3-.2-.5-.4-.7-.7-.2-.3-.3-.6-.3-.9 0-.2.1-.4.2-.5.2-.2.4-.4.7-.5.2-.1.5-.1.7-.1.4 0 .8.1 1.1.3.3.2.5.4.7.7.2.3.3.6.3.9M12 17c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4"/></svg>},
];


export default function SubscriptionPage() {
    return (
      <div className="flex justify-center items-start p-4 pt-8">
        <Card className="w-full max-w-2xl shadow-2xl">
            <CardHeader className="text-center p-6 md:p-8">
                <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4">
                    <BriefcaseIcon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold">Agency Plan</CardTitle>
                <CardDescription className="text-md md:text-lg text-muted-foreground">
                    Unlock powerful features for your agency and scale your advertising efforts across all major platforms.
                </CardDescription>
                <div className="pt-4">
                    <span className="text-4xl md:text-5xl font-extrabold">$50</span>
                    <span className="text-lg md:text-xl text-muted-foreground">/year</span>
                </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-8">
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-center">Core Agency Features</h3>
                    <ul className="space-y-4">
                        {agencyFeatures.map((feature, index) => (
                            <li key={index} className="flex items-center gap-4">
                                {feature.icon}
                                <span className="font-medium text-sm md:text-base">{feature.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="border-t pt-8">
                    <h3 className="text-lg font-semibold mb-4 text-center">Supported Agency Platforms</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        {platforms.map(platform => (
                            <div key={platform.name} className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                                <div className="text-primary">{platform.icon}</div>
                                <p className="mt-2 text-sm font-semibold">{platform.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-6 md:p-8">
                <Button size="lg" className="w-full text-md md:text-lg">
                    Subscribe Now
                </Button>
            </CardFooter>
        </Card>
      </div>
    );
}
