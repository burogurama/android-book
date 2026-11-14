# What Android is

## Questions this chapter answers

- What is Android made of?
- Android uses the Linux kernel. So how is it different from a Linux system on a laptop?
- What are the main ideas that the rest of the system is built on?
- What is AOSP, and which parts of a phone's software are not in it?
- Which companies write the software on one phone?
- What are Android versions and API levels?

## An operating system in two parts

An operating system has two parts.

The first part is the **kernel**. The kernel is the program that controls the hardware. It decides which process runs on which processor core. It gives memory to processes. It talks to the storage, the screen, and the radio. Normal programs cannot touch hardware directly. They must ask the kernel, and they ask through system calls.

The second part is the **user space**. This is every program that runs on top of the kernel: the first process that starts the others, the libraries, the background programs, and in the end the apps.

Android uses the **Linux kernel** as its kernel. This is the same kernel that runs on servers and laptops, with some changes that later chapters explain.

Android does **not** use the user space of a normal Linux system. Almost everything above the kernel was written for Android. This is the most important fact in this chapter. When people say "Android is Linux", it is true for the kernel and false for nearly everything else.

## Android compared with a desktop Linux system

A desktop Linux system, for example Ubuntu, is the Linux kernel plus a known set of user space programs. Android replaces each one of them.

| Job | Desktop Linux | Android |
|---|---|---|
| C library | glibc | Bionic |
| First process, starts everything else | systemd | Android `init` |
| Calls between processes | D-Bus, Unix sockets | Binder |
| Drawing windows on the screen | X11 or Wayland | SurfaceFlinger |
| Format of an installed program | `.deb` or `.rpm` package | APK |
| How a program runs | A native program, run as the user who started it | Bytecode in a virtual machine, run as a user created only for that app |
| Access to hardware from user space | Mostly through kernel drivers | Kernel drivers plus hardware abstraction layers (HALs) |

Each row is a topic of this book. Here is a short meaning for each name, so that the table is not only a list of words.

- **Bionic** is Android's C library. A C library is the code that gives programs functions such as `malloc`, `printf`, and `open`. Under these functions, the library makes the system calls to the kernel. Bionic is smaller than glibc and has a more permissive licence.
- **`init`** is the first user space process. The kernel starts it, and it starts everything else. Android has its own `init` with its own configuration language.
- **Binder** is how one process calls a function inside another process. Android uses it for almost all communication between apps and the system.
- **SurfaceFlinger** is the program that takes the images drawn by each app and combines them into the final image on the screen.
- **APK** (Android Package) is the file that holds one app: its code, its resources, and a description of the app named the manifest.
- A **HAL** (Hardware Abstraction Layer) is code written by the hardware maker. It sits between Android and one kind of hardware, for example the camera. It gives Android a standard interface, so Android does not need to know the details of each camera.

## The three ideas under everything

Three design decisions shape the whole system. The rest of the book explains them in detail. It helps to see them early, because almost every chapter connects to at least one of them.

### Idea 1: each app is a separate Linux user

On a desktop, a Linux user is a person. The kernel gives each user a number, the **UID** (user ID). The kernel uses the UID to decide which files a process can open and which other processes it can send signals to. All programs that one person starts run with that person's UID. So they can all read that person's files.

Android uses the same kernel feature for a different goal. When an app is installed, Android creates a new UID only for that app. App UIDs start at 10000. Every process of that app runs with that UID. The app's private files belong to that UID.

The effect is that the kernel separates apps from each other in the same way it separates two people on a shared server. App A cannot open the private files of app B, because for the kernel they are files of another user. Nobody had to write a new protection system for this. The old Unix permission checks do the work.

This separation is the base of the **app sandbox**. A sandbox is a closed space where a program runs with limited access to everything outside. Later Android versions added more walls to the sandbox, such as SELinux and seccomp. The UID is still the first wall.

### Idea 2: app code runs in a virtual machine, and every app process is a copy of one process

Most Android app code is written in Kotlin or Java. It is not compiled to machine code for one processor. It is compiled to **DEX bytecode**. Bytecode is a set of instructions for a machine that does not exist as hardware. A program named a **virtual machine** reads these instructions and carries them out on the real processor.

Android's virtual machine is **ART**, the Android Runtime. ART can run DEX code in three ways. It can interpret it, which means reading and performing one instruction at a time. It can compile it to machine code while the app runs, which is named just-in-time (JIT) compilation. It can compile it to machine code before the app runs, which is named ahead-of-time (AOT) compilation. Real devices use a mix of all three.

Starting a virtual machine is slow. It must load thousands of classes that every app needs. If each app did this at launch, every launch would be slow, and each app would hold its own copy of the same data in memory.

Android solves this with a process named **zygote**. Zygote starts once, when the device boots. It starts ART and loads the common classes and resources. Then it waits. When the system needs a new app process, it asks zygote. Zygote calls `fork`, the system call that makes a copy of the calling process. The copy becomes the new app process.

The copy already has a running virtual machine with the common classes loaded. So the app starts fast. And because `fork` shares memory pages between parent and child until one of them writes to a page, all apps share one physical copy of the common data.

### Idea 3: an app does almost nothing alone, it asks a system service through Binder

An app process has very few rights. It cannot open the camera device. It cannot read the list of installed apps from disk. It cannot draw directly on the screen. It cannot start another app's process.

For each of these things there is a **system service**. A system service is code that runs in a process with more rights and does the work for apps. Most system services run inside one process named **`system_server`**. It holds more than a hundred services. Examples are the Activity Manager, which starts and stops app processes, and the Package Manager, which knows every installed app.

An app talks to a system service through **Binder**. From the app's side it looks like a normal function call on an object. In reality, the Binder driver in the kernel carries the call to the service's process, and carries the result back.

Binder also tells the service who is calling. The kernel attaches the UID and the process ID of the caller to each call. The caller cannot fake them. So the service can check whether this caller is allowed to do what it asks. This is how Android permissions are enforced in most cases: the service receives a call, reads the caller's UID from Binder, and checks whether the app with that UID holds the needed permission.

Here is the full path of one request, to show how the three ideas work together.

```text
   App process (its own UID)                 system_server (UID system)
  +---------------------------+             +----------------------------+
  |  App code (DEX, in ART)   |             |  System service code       |
  |          |                |             |          ^                 |
  |  calls a method on a      |             |  checks the caller's UID   |
  |  service proxy object     |             |  and its permissions       |
  |          v                |             |          |                 |
  +----------|----------------+             +----------|-----------------+
             |        user space                       |
  ===========|=========================================|==================
             |        kernel                           |
             +-------------> Binder driver ------------+
                     (adds caller UID and PID)
```

## AOSP: the open source part

**AOSP** means Android Open Source Project. The name is used for two things: the public source code of Android, and the project led by Google that publishes it.

AOSP contains a complete operating system. It has the kernel sources, `init`, Bionic, Binder, ART, the framework with all system services, and a set of basic apps such as a launcher and a settings app. You can build AOSP and run it on an emulator or on some devices with no other software.

Most of the user space code in AOSP uses the Apache 2.0 licence. This licence lets a company change the code and ship the result without publishing its changes. The Linux kernel is different. It uses the GPL version 2 licence, which requires a company that ships a changed kernel to publish the kernel source.

### What is not in AOSP

A phone you buy contains much more than AOSP. Three groups of software are outside it.

1. **Google Mobile Services (GMS).** These are Google's own apps and services: Google Play Store, Google Play services, Chrome, Maps, and others. They are closed source. A device maker must sign an agreement with Google to ship them. Many apps depend on Google Play services, for example for push notifications. So a device without GMS runs Android, but many popular apps do not work fully on it.
2. **Hardware-specific code.** This includes the device drivers that are not in the public kernel, the HAL implementations, and the firmware of the modem, the GPU, and other chips. The chip maker and the device maker write this code. Most of it is closed source.
3. **Device maker changes.** Companies such as Samsung and Xiaomi change the framework and add their own apps and user interface.

Some systems use AOSP without GMS. Examples are Amazon's Fire OS, community systems such as LineageOS and GrapheneOS, and many devices sold in China.

### Compatibility

If every device maker changes Android freely, an app could work on one device and fail on another. Google limits this with two tools.

- The **Compatibility Definition Document (CDD)** is a text that lists what a device must do. For example, it says which security features must be present.
- The **Compatibility Test Suite (CTS)** is a large set of automatic tests. It checks that the public interfaces of the device behave as documented.

A device maker who wants to ship GMS must pass these tests. This is why internals knowledge moves well from one device to another: the parts that apps can see must behave the same everywhere. The parts apps cannot see, such as the HAL implementations, can differ a lot.

## Who writes the software on one phone

At least three companies write the software of a typical phone. This is not only a business detail. It decided the technical design of the system, as the next section shows.

1. **Google** writes AOSP.
2. **The SoC vendor** writes the code for the chip. SoC means System on a Chip. It is the main chip of the phone, with the processor cores, the graphics processor, the modem, and more in one package. Qualcomm, MediaTek, and Samsung are SoC vendors. The SoC vendor writes the kernel drivers, the HALs, much of the bootloader, and the firmware.
3. **The OEM** makes the final device. OEM means Original Equipment Manufacturer. The OEM takes AOSP and the SoC vendor's code, adds its own changes, and ships the result.

### Why this caused a problem, and the two answers

In early Android, these three layers of code were mixed together in one system image. To update a phone to a new Android version, the SoC vendor first had to update its code for the new version. Then the OEM had to update its own changes on top of that. Only then could the phone get the update. This took many months, and for many phones it never happened.

Android made two large design changes to fix this.

**Project Treble** arrived in Android 8.0. It split the system into two sides with a fixed, versioned interface between them. One side is the Android framework, written by Google and changed by the OEM. The other side is the vendor implementation, written by the SoC vendor. Each side lives on its own partition: the framework on `system`, the vendor code on `vendor`. Because the interface between them is fixed, a new framework can run on top of an old vendor implementation.

**Project Mainline** arrived in Android 10. It took some components of the system and turned them into modules that Google can update directly, through the Play Store infrastructure, without a full system update from the OEM. ART itself has been such a module since Android 12.

Later parts of this book explain both in detail. They are named here because they explain the shape of the system. When you see that the system is split into `system` and `vendor` partitions, or that a core library lives in a strange package format named APEX, the reason is this update problem.

## Versions and API levels

Each Android release has three names.

- The **version number**, for example Android 17. This is the public name.
- The **API level**, for example 37. This is a whole number. It names the version of the interface that Android gives to apps. It goes up by one with each release that changes that interface. Apps and the system use the API level, not the version number, in all checks.
- The **code name**. Older releases had public dessert names. Newer releases still have internal ones. The first letter also appears in build identifiers and in source code.

An app states two API levels in its manifest. The **minimum SDK version** is the oldest API level the app can run on. The **target SDK version** is the API level the app was written and tested for. The target SDK version matters a lot for internals. When a new Android version makes a rule stricter, it often applies the new rule only to apps whose target SDK version is new enough. Old apps keep the old behaviour. So the same system treats two apps differently, based on a number in their manifest. You will see checks of the target SDK version all over the framework source.

The table below lists the releases since Android 5.0 with one or two changes in each that matter for this book. It is not a full list of changes.

| Version | API level | Year | Code name | Changes that matter for internals |
|---|---|---|---|---|
| 5.0 | 21 | 2014 | Lollipop | ART replaces the Dalvik virtual machine. SELinux is enforced for all processes. 64-bit support. |
| 6.0 | 23 | 2015 | Marshmallow | Runtime permissions: the user grants dangerous permissions while the app runs, not at install. |
| 7.0 | 24 | 2016 | Nougat | ART mixes JIT with profile-guided AOT. File-based encryption. A/B system updates. APK Signature Scheme v2. |
| 8.0 | 26 | 2017 | Oreo | Project Treble. A seccomp filter for all apps. |
| 9 | 28 | 2018 | Pie | Restrictions on non-SDK interfaces. APK Signature Scheme v3. |
| 10 | 29 | 2019 | Quince Tart | Project Mainline and APEX. Dynamic partitions. Scoped storage. |
| 11 | 30 | 2020 | Red Velvet Cake | Virtual A/B updates. The Generic Kernel Image (GKI) project starts. |
| 12 | 31 | 2021 | Snow Cone | ART becomes a Mainline module. |
| 13 | 33 | 2022 | Tiramisu | The Android Virtualization Framework ships on the first devices. |
| 14 | 34 | 2023 | Upside Down Cake | Apps that target an API level below 23 can no longer be installed. |
| 15 | 35 | 2024 | Vanilla Ice Cream | Support for devices with 16 KB memory pages. |
| 16 | 36 | 2025 | Baklava | Release moves to the middle of the year. |
| 17 | 37 | 2026 | Cinnamon Bun | The baseline version for this book. |

Some numbers are missing from the API level column. They belong to smaller releases: 22 is Android 5.1, 25 is Android 7.1, 27 is Android 8.1, and 32 is Android 12L.

### How the source code is published

Google does not develop Android in the open. Google engineers work on an internal branch. The public gets the source code when a release is published.

Two recent changes are useful to know when you read the source.

- Since 27 March 2025, the public `aosp-main` branch is read-only. Google recommends the `android-latest-release` branch. It always points to the newest release that was published.
- Since 2026, Google publishes new source code to AOSP twice a year, in the second and the fourth quarter. Before that, it was once per quarter.

## Security view

This chapter has no mechanism to attack yet. But it already gives the base of Android's security model, which is a set of decisions about who is trusted.

- **Apps are not trusted.** The system assumes any app may be hostile. This is very different from a classic desktop, where a program the user starts gets all of the user's rights. Idea 1 (one UID per app) and idea 3 (ask a service, and the service checks the caller) both come from this assumption.
- **The kernel is fully trusted.** The UID separation only holds if the kernel is correct. A bug in the kernel that lets a process change its own UID breaks the sandbox for every app. This is why kernel bugs are the most valuable ones on Android.
- **System services are trusted, and they are a large target.** Every permission check lives in service code. If a service forgets a check, or checks the wrong thing, an app can make the service do something the app itself has no right to do. `system_server` has more than a hundred services, each with many methods that any app can call. This is a large surface.
- **Code from three companies runs with high rights.** The SoC vendor's drivers run inside the kernel. Vendor HALs run in processes that can reach hardware. This code is mostly closed source and gets less public review than AOSP. Many real attacks on Android devices went through vendor drivers. Project Treble helped here as a side effect: once vendor code was separated behind a fixed interface, it could also be put in its own processes with its own restrictions.
- **The user is partly trusted.** The user can grant permissions to an app. But the user cannot, on a normal device, give an app the rights of the system.

## Check your understanding

1. A friend says "Android is just Linux with a different desktop". Which part of this is correct, and which part is wrong? Give three examples of user space components that Android replaces.
2. Two apps are installed on a phone. Explain, using only kernel concepts, why the first app cannot read the private files of the second app.
3. Why does Android copy every app process from zygote, instead of starting a new virtual machine for each app? Name the two benefits.
4. An app wants the current location of the device. Describe the path of this request in general terms. Where is the permission check done, and how does the code that does the check know which app is asking?
5. Why can the caller of a Binder call not lie about its UID?
6. A device runs Android but has no Google Play Store. Is this possible? What software is the device missing, and what is the practical effect?
7. What problem did Project Treble solve? Why did that problem exist at all?
8. An app has a target SDK version of 28 and runs on Android 17. Why does the system care about this number?

## Sources

- Android architecture overview: <https://source.android.com/docs/core/architecture>
- Platform architecture, from the app developer side: <https://developer.android.com/guide/platform>
- Release lifecycle and branches: <https://source.android.com/docs/setup/contribute/release-lifecycle>
- Code names, tags, and build numbers: <https://source.android.com/docs/setup/reference/build-numbers>
- Compatibility Definition Document: <https://source.android.com/docs/compatibility/cdd>
- Compatibility Test Suite: <https://source.android.com/docs/compatibility/cts>
- Application sandbox: <https://source.android.com/docs/security/app-sandbox>
