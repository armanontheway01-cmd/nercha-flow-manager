# Remix of Nercha Connect

Today we have to develop a clean website for managing food distribution of mampuram aandu nercha. currently Mamburam aandu nerach is run By management of Darul Huda islamic university with high human resourses of it's teachers and students. duties are assainged and managed by a head teacher who assaing incharges for various duties and split students among various duties. here the workflow should be, a home page where piublic can see some status like, distribution is ongoning, gallery images etc.. and admin page where all duties, home page everything are managed by head teacher, incharge login where subincharge teachers who assaigned by head teacher can login using fixed credintial by admin and can manage assained duties. and student login where student can see thier assaigned duties, thier incharge, and time.

admin credintial: userid:8089346495, Password:nercha, incharge login: specified by admin, student login: username and password is thier adno which is added by admin with thier name.

we have to add different kinds of features in website.
1. add and manage duties
2. add, manage and assaign student volunteers: when adding student these details will be provided, Adno, Name, Dept., phone number, status of present of absent. show  student names in tabular form with show thier assained duty, also a action button of edit, delete and whatsapp where directly message them through whatsapp.
3. Assaign duty incharges for different duties: add teachers with Name, phone number. show thier details in tabular form, and add option of assaign duties in table where list already added duties.

in both incharges and student list add option of bulk upload, download template file
4. in duty table, selecting a duty admin can assaingn multiple students and incharges, if a student is already assaigned duty his name will disappear, in duty assaigning add optioin to promote a student as captain of duty.. in student list admin can see available student who didn't got assaigned of any duty and who did.
5. in admin side add optioin of inventry management, and donation reciept record.
6. add option of token genration, where admin create unique qr code with hidden count of packets, name. admin can share the image of qr code.
7. add another login of Food distributer, in his login there will be option of scan qr code which was made by admin and decode the qr code, supply that count packets for the donator.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://nercha-flow-manager.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4042a356-59b5-4787-8d2e-137c4762b6f7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
