# Treasure_Hunt
The main Focus of this project is on Devops pipline. Tools used are Github Actions, Docker, Ansible, ELK stack. This will also help if you have a javascript application and want to create a devops pipeline for it. 

if you are new to Devops and looking for simple hands on project, I higly recommend my blog https://basicdevopshandsonproject.wordpress.com/2021/03/14/basic-devops-using-hands-on-example/

Here the sample application is mostly inspired from https://youtube.com/playlist?list=PLcIaPHraYF7k4FbeGIDY-1mZZdjTu9QyL. And in this repository we will see devops tool chain in action.

## Pipeline
1. whenever a new commit has been pushed, it triggers github action file.
2. which then creates a docker conatiner and pushes it into Dockerhub.
3. An Ansible script is then triggred which deploys the docker container on remote virtual machine, in my case it is a VM in Azure Cloud.

The details can be found in Report.pdf file in the repository. 


