import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star, ShieldCheck, Globe, InfinityIcon, BriefcaseIcon } from "lucide-react";

const agencyFeatures = [
    {
      icon: <InfinityIcon className="h-5 w-5 text-primary" />,
      text: "Unlimited Google ad accounts",
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
      icon: <Check className="h-5 w-5 text-primary" />,
      text: "Support for Google Ads platform",
    },
    {
      icon: <Star className="h-5 w-5 text-primary" />,
      text: "Priority customer support",
    },
];

export default function SubscriptionPage() {
    return (
      <div className="flex justify-center items-start p-4 pt-8">
        <Card className="w-full max-w-2xl shadow-2xl">
            <CardHeader className="text-center p-4 md:p-6">
                <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4">
                    <BriefcaseIcon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold">Agency Plan</CardTitle>
                <CardDescription className="text-md md:text-lg text-muted-foreground">
                    Unlock powerful features for your agency and scale your Google advertising efforts.
                </CardDescription>
                <div className="pt-4">
                    <span className="text-4xl md:text-5xl font-extrabold">$50</span>
                    <span className="text-lg md:text-xl text-muted-foreground">/year</span>
                </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
                <ul className="space-y-4">
                    {agencyFeatures.map((feature, index) => (
                        <li key={index} className="flex items-center gap-4">
                            {feature.icon}
                            <span className="font-medium text-sm md:text-base">{feature.text}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter className="p-4 md:p-6">
                <Button size="lg" className="w-full text-md md:text-lg">
                    Subscribe Now
                </Button>
            </CardFooter>
        </Card>
      </div>
    );
}
