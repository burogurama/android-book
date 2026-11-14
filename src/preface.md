# About this book

This book explains how Android works on the inside.

It is not about writing apps. It is about what happens under an app: the hardware, the boot process, the Linux kernel, the native programs, the virtual machine, the system services, and the security model that ties them together.

## How the book is ordered

The book goes from the bottom to the top.

It starts at the hardware and the boot process. Then it covers the kernel, then the native programs that run on the kernel, then Binder, then the virtual machine, then the framework, and last the apps.

The reason for this order is simple. Each layer of Android is built on the layer below it. If you read the layers in this order, each chapter only needs things that an earlier chapter already explained.

Security is the exception. Security is not one layer. Every layer has its own part in it. So each chapter ends with a section named **Security view**, and the last part of the book puts all of those sections together into one model.

## What the reader should already know

The book expects that you know the basics of operating systems:

- what a process and a thread are,
- what a system call is,
- what virtual memory is,
- how to read C and Java code.

The book does not teach these from zero. When a chapter needs one of them, it gives a short reminder and then spends its time on what Android does with it.

## Which Android version

The book describes the Android Open Source Project as of **Android 17** (API level 37), released in June 2026.

Android changed a lot over the years. When a mechanism was added, replaced, or removed in a known version, the chapter says so. This matters because real devices run many different versions.

## How each chapter is built

Every chapter has the same parts:

1. **The questions** the chapter answers.
2. **The explanation**, with diagrams and references to the real source code.
3. **Security view**: what this layer protects, what it trusts, and how it can fail.
4. **Check your understanding**: questions you should be able to answer after reading.
5. **Sources**: the documentation and source files the chapter is based on.

## Sources

The main sources are the Android source code itself and the official documentation at `source.android.com`. Source files are named by their path in the source tree, for example `system/core/init/init.cpp`. You can open any of these paths at <https://cs.android.com>.
