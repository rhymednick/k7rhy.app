import React from 'react';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { FileTextIcon, ExternalLinkIcon } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Balancer } from 'react-wrap-balancer';

export enum DocIndexItemType {
    Internal, // Displays a doc page icon
    External, // Displays an external link icon
}

export interface DocIndexItem {
    title: string;
    href: string;
    description: string;
    type?: DocIndexItemType;
}

export interface DocIndexCardProps {
    title: string;
    description?: string;
    items?: DocIndexItem[];
}

export function DocIndexCard(props: DocIndexCardProps) {
    const description = props.description ? (
        <CardDescription className="mb-4">
            <Balancer>{props.description}</Balancer>
        </CardDescription>
    ) : null;

    return (
        <div>
            <Card className="mb-4 mt-4">
                <CardHeader>
                    <CardTitle>{props.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    {description}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead />
                                <TableHead>Title</TableHead>
                                <TableHead>Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {props.items?.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        {item.type ===
                                        DocIndexItemType.External ? (
                                            <ExternalLinkIcon />
                                        ) : (
                                            <FileTextIcon />
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {item.type ===
                                        DocIndexItemType.External ? (
                                            <Link
                                                href={item.href}
                                                target="_blank"
                                            >
                                                {item.title}
                                            </Link>
                                        ) : (
                                            <Link href={item.href}>
                                                {item.title}
                                            </Link>
                                        )}
                                    </TableCell>
                                    <TableCell>{item.description}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
