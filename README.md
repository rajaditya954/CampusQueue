# Campus Queue

> **Don't wait in line. Know your time.**

Campus Queue is a digital queue management system designed for campus service centers where students currently have to physically stand in line to get their work done.

Instead of making students wait without knowing what is happening, Campus Queue allows them to **join a digital queue, see their position, estimate their waiting time, and know approximately when their service will be completed.**

The system goes beyond simple token management by estimating waiting time based on the **actual services requested by the students ahead in the queue.**

---

## 01. Problem

At our college, campus services are handled through physical queues.

There is no digital queue system or even a physical token system. When students need to get something done at an office or service counter, they simply stand in line and wait for their turn.

The problem is not just the waiting itself — it is the **uncertainty**.

A student may see 10 people standing ahead of them, but they have no idea:

* How long those people will take
* How long they will have to wait
* When their turn will arrive
* Whether they can leave the queue temporarily
* Whether their work can be completed within the available time

This becomes even more unpredictable because **different services take different amounts of time**.

For example, a student making a simple payment may take only a few minutes, while another student requiring document verification or multiple checks may take considerably longer.

A traditional physical line provides almost no useful information beyond:

> **"You are behind these people."**

Campus Queue aims to answer the more useful question:

> **"When is it likely to be your turn?"**

---

## 02. Why I Built This

I personally experienced this problem while getting work done at my college.

At our college, there is no token system — digital or physical. Students simply stand in line and wait for their turn.

I found myself waiting in these queues without knowing how much longer I would have to stay there. Even when there were only a few people ahead, it was difficult to predict the actual waiting time because everyone's work was different.

Sometimes a student might finish in a couple of minutes, while another student's request could take much longer because it requires document verification, multiple checks, or additional processing.

What frustrated me most was not just the waiting — it was the **uncertainty**.

Once you stand in the line, leaving it can mean losing your place. You can't easily attend a class, grab something to eat, study, or work on something else because you don't know when your turn will come.

I personally felt that there should be a better way.

That led me to a simple question:

> **What if I could join the queue digitally, leave the waiting area, and know approximately when I actually need to come back?**

That question became the foundation for **Campus Queue**.

The goal wasn't just to create a digital token system. It was to make the waiting experience more **predictable, flexible, and useful** for students.

---

## 03. Solution

Campus Queue converts the traditional physical waiting line into a **real-time digital queue**.

A student can:

1. Select the service they need.
2. Join the queue digitally.
3. Receive their queue position.
4. See how many people are ahead.
5. View an estimated waiting time.
6. View an estimated service completion time.
7. Receive real-time updates as the queue moves.
8. Temporarily skip their turn and rejoin later according to the configured queue policy.

### The important difference

Campus Queue does not assume that every student takes the same amount of time.

Instead, the system considers the **type of service requested by each person ahead**.

For example:

| Queue Position | Service               | Estimated Processing Time |
| -------------- | --------------------- | ------------------------: |
| #21            | Payment               |                     3 min |
| #22            | Document Verification |                     8 min |
| #23            | Certificate Request   |                     6 min |

A basic queue system might calculate:

```text
3 people × 5 minutes = 15 minutes
```

Campus Queue instead calculates:

```text
3 + 8 + 6 = 17 minutes
```

The estimate therefore reflects the actual workload currently ahead in the queue.

---

## 04. Key Decisions

### 1. Service-based estimation

The most important design decision was to avoid treating every person in the queue equally.

Different services require different amounts of staff time.

Therefore, the queue estimation engine considers the service requested by each person ahead instead of using a single fixed duration for every queue position.

This makes the estimation more meaningful while keeping the algorithm simple and explainable.

---

### 2. Rolling service-time estimates

Service processing times can change over time.

For example, a document-verification process that usually takes 8 minutes might start taking 6 minutes as the workflow becomes faster.

Instead of permanently hardcoding service durations, Campus Queue uses a rolling estimate based on:

* Historical average processing time
* Recent actual processing times

Conceptually:

```text
Updated Estimate
=
Historical Estimate × Historical Weight
+
Recent Estimate × Recent Weight
```

Recent processing times can therefore gradually influence future estimates.

This allows the system to adapt without requiring complex machine-learning models.

---

### 3. Deterministic algorithm instead of complex ML

We deliberately chose a deterministic queue estimation approach.

The system does not need a complicated machine-learning model to solve the initial problem.

The estimate can be calculated using understandable inputs such as:

* Service type
* Current queue position
* Estimated processing duration
* People currently ahead
* Current queue state

This makes the system:

* Easier to understand
* Easier to test
* Easier to debug
* More transparent
* Suitable for a free-tier prototype

---

### 4. Real-time queue updates

A queue changes continuously.

When a staff member completes one service or calls the next student, everyone else's position and estimated waiting time can change.

Therefore, the application is designed around **real-time updates** instead of repeatedly polling the server at aggressive intervals.

Firebase provides the real-time infrastructure required for this.

---

### 5. Confidence indicator

Waiting-time estimates should not appear as guaranteed promises.

Campus Queue therefore includes a simple confidence indicator:

* 🟢 **High confidence** — enough reliable recent data
* 🟡 **Moderate confidence** — some variation or limited recent data
* ⚪ **Initial estimate** — insufficient historical data

This helps students understand how reliable the displayed estimate is.

---

### 6. Digital queue instead of physical waiting

The goal is not simply to replace a physical line with a token number.

The goal is to allow students to **participate in the queue without physically standing there the entire time**.

Students can see the queue status digitally and make better decisions about when they need to return.

---

### 7. Free-tier-friendly architecture

The project prioritizes Google technologies and free/open-source technologies wherever practical.

The architecture is designed to avoid unnecessary paid infrastructure.

No secret API keys or service-account credentials are exposed in the frontend.

---

## 05. Features

### Student Features

* Digital queue joining
* Service selection
* Queue/token position
* Number of people ahead
* Estimated waiting time
* Estimated service completion time
* Real-time queue updates
* Queue status
* Confidence indicator
* Skip and rejoin functionality
* Responsive mobile-friendly interface

### Staff/Admin Features

* Operational queue dashboard
* View active queue
* Call the next student
* Start service
* Complete service
* Monitor current queue
* View service workload
* Manage queue operations
* Configure queue policies

### Demo Mode

The project includes a demo mode for testing and presentations.

Demo mode can simulate:

* Students joining the queue
* Different service types
* Staff calling students
* Service completion
* Queue movement
* Automatic waiting-time recalculation

This allows the complete concept to be demonstrated without requiring a real campus service center.

---

## 06. Technology

### Google Technologies

| Technology                  | Why it is used                                                                          |
| --------------------------- | --------------------------------------------------------------------------------------- |
| **Firebase Authentication** | Handles authentication for students and administrators                                  |
| **Cloud Firestore**         | Stores users, queues, services, and processing-time data with real-time synchronization |
| **Firebase Security Rules** | Controls who can read and modify different types of data                                |
| **Firebase Hosting**        | Hosts and serves the production web application                                         |
| **Google Material Design**  | Provides a consistent, accessible, and modern UI foundation                             |

### Application Technologies

| Technology                  | Purpose                                       |
| --------------------------- | --------------------------------------------- |
| **React**                   | Frontend application                          |
| **Vite**                    | Fast development and production build tooling |
| **JavaScript / TypeScript** | Application and business logic                |
| **Material UI / CSS**       | Responsive user interface                     |
| **Firebase SDK**            | Communication with Firebase services          |

### Why these technologies?

The project prioritizes technologies that are:

* Accessible to students
* Free-tier friendly
* Well documented
* Easy to deploy
* Suitable for real-time applications
* Scalable beyond a basic prototype

---

## 07. Architecture

Campus Queue follows a modular architecture where the user interface, Firebase integration, authentication, business logic, and queue estimation engine are separated.

```text
                         ┌───────────────────────┐
                         │       Student UI      │
                         │    React + Material   │
                         │        Design         │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │    Business Logic     │
                         │                       │
                         │ Queue Management      │
                         │ Service Management    │
                         └───────────┬───────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
                    ▼                                 ▼
        ┌──────────────────────┐          ┌──────────────────────┐
        │    Queue Engine      │          │   Firebase Layer     │
        │                      │          │                      │
        │ • Wait estimation    │          │ • Authentication     │
        │ • Completion time    │          │ • Firestore          │
        │ • Queue status       │          │ • Security Rules     │
        │ • Confidence         │          │                      │
        └──────────┬───────────┘          └──────────┬───────────┘
                   │                                 │
                   └────────────────┬────────────────┘
                                    ▼
                         ┌───────────────────────┐
                         │    Cloud Firestore    │
                         │                       │
                         │ • Users               │
                         │ • Queue entries       │
                         │ • Services            │
                         │ • Processing times    │
                         │ • Queue events        │
                         └───────────┬───────────┘
                                     ▲
                                     │
                         ┌───────────┴───────────┐
                         │    Admin Dashboard    │
                         │    React + Material   │
                         │        Design         │
                         └───────────────────────┘
```

### Queue Estimation Flow

```text
Student selects service
          │
          ▼
Student joins queue
          │
          ▼
Find people ahead
          │
          ▼
Identify their service types
          │
          ▼
Get estimated processing
time for each service
          │
          ▼
Calculate total expected
processing time ahead
          │
          ▼
Calculate estimated wait
          │
          ▼
Calculate estimated
completion time
          │
          ▼
Determine confidence level
          │
          ▼
Display result to student
          │
          ▼
Queue changes?
     │          │
    YES         NO
     │
     ▼
Recalculate estimate
```

### Modular Structure

```text
src/
│
├── components/
│
├── pages/
│
├── layouts/
│
├── auth/
│
├── services/
│   └── firebase/
│
├── queue/
│   ├── estimator
│   ├── serviceTimes
│   └── queueStatus
│
├── business/
│
├── hooks/
│
├── utils/
│
├── styles/
│
└── App
```

The queue estimation engine is intentionally separated from the UI so that the calculation logic can be tested independently.

---

## 08. Getting Started

### Prerequisites

Make sure you have:

* Node.js
* npm
* A Firebase project
* Firebase Authentication enabled
* Cloud Firestore enabled
* Firebase CLI

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd campus-queue
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Firebase

Create a Firebase project and enable the required Firebase services.

Create a local environment file:

```text
.env
```

Add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> **Important:** Never commit private credentials, service-account keys, or other secrets to GitHub.

### 4. Start the development server

```bash
npm run dev
```

Open the local URL provided by Vite.

### 5. Build the application

```bash
npm run build
```

### 6. Preview the production build

```bash
npm run preview
```

---

## 09. Deployment

Campus Queue is designed to be deployed using **Firebase Hosting**.

After configuring Firebase:

```bash
npm run build
firebase deploy
```

The production application is hosted using Firebase Hosting.

### Live Application

**Coming soon / Add deployed URL here**

```text
<YOUR_DEPLOYED_APPLICATION_URL>
```

### GitHub Repository

```text
<YOUR_GITHUB_REPOSITORY_URL>
```

---

## 10. Limitations & Next Steps

Campus Queue is currently a prototype designed to demonstrate how a digital campus queue could improve the physical waiting experience.

### Current Limitations

#### 1. Estimates are not guarantees

Processing times can change because of:

* Staff availability
* Unexpected service requirements
* Technical issues
* Student-specific situations
* Interruptions
* Changes in queue operations

Therefore, the estimated completion time should be treated as an approximation rather than a guaranteed appointment time.

---

#### 2. Limited initial data

When a service is newly introduced, there may not be enough historical processing data.

The system therefore starts with an initial estimate and becomes more reliable as actual service data is collected.

---

#### 3. Complex service environments

The current model works best for straightforward queue-based service counters.

A campus environment with:

* Multiple counters
* Different staff capabilities
* Parallel processing
* Priority queues
* Emergency requests

would require additional queue-management logic.

---

#### 4. Prototype-scale deployment

The current project is intended as a working prototype.

A university-wide production deployment would require additional work around:

* Large-scale traffic
* Monitoring
* Reliability
* Data retention
* Privacy
* Accessibility
* Administrative workflows
* Security auditing

---

### Future Improvements

With more time, the system could be extended with:

* Multiple service counters
* Multiple campus service centers
* QR-code based queue joining
* Notifications when a student's turn is approaching
* SMS/email notifications
* Calendar integration
* Peak-hour analysis
* Historical queue analytics
* Better staff/counter assignment
* Advanced service-time prediction
* Priority queue support
* Appointment integration
* Campus-wide deployment
* Accessibility improvements
* Production-grade monitoring

---

## Why Campus Queue?

Campus Queue is not trying to make queues disappear.

It is trying to make them **predictable**.

A traditional physical queue tells you:

> **"Stand here and wait."**

A basic token system tells you:

> **"Your number is 27."**

Campus Queue tries to tell you:

> **"You're 27th, there are approximately 18 minutes of work ahead of you, and your service is expected around 2:40 PM."**

That difference can turn **waiting time into usable time**.

---

## Project Status

🚧 **Currently in development / prototype**

The core queue management and estimation concept has been implemented, with the project being refined for real-world campus use.

---

## License

This project is currently developed as an academic/prototype project.

If the project is released as open source, an appropriate license such as the MIT License can be added here.
