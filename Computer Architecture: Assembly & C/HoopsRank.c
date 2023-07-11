/*  C program called HoopsRank.c to rank basketball teams based on a combined metric. 
The tool will take a file as an input formatted with entries that are 4 lines long 
(basketball team name followed by 3 stats to be used to calculate a metric.) File end with word "DONE".
Program outputs list of team names and corresponding metric sorted in order of descending metrics 
and equal metrics sorted alphabetically*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
//node struct holdning team info
struct hrank{
    char name[63];
    int metric;
    struct hrank* next;
};
//
void newNode(struct hrank* first,char* team, int metric){
    struct hrank* temp=(struct hrank*)malloc(sizeof(struct hrank));
    strcpy(temp->name,team);
    temp->metric=metric;
    temp->next=NULL;
    if(temp->metric>first->metric){
       strcpy(temp->name,first->name);
       temp->metric=first->metric;
       temp->next=first->next;
       first->next=temp;
       strcpy(first->name,team);
       first->metric=metric;
        return;
    }
    if(temp->metric==first->metric)
    {
        if((strcmp(temp->name,first->name))<0)
        {
            strcpy(temp->name,first->name);
            temp->next=first->next;
            first->next=temp;
            strcpy(first->name,team);
            first->metric=metric;
           return;
        }
        else
        {
            if(first->next!=NULL && strcmp(temp->name,first->next->name)>0)
            {
                goto loop;
            }
            else
            {
                temp->next=first->next;
                first->next=temp;
                return ;
            }
        }
    }
    else{
    loop:
    struct hrank* current;
    current=first->next;
    struct hrank* prev;
    prev=first;
    while(current!=NULL){
        if(temp->metric>current->metric){
        prev->next=temp;
        temp->next=current;
        return;
        } 
        if(temp->metric==current->metric)
            {
                if((strcmp(temp->name,current->name))<0)
                {
                    prev->next=temp;
                    temp->next=current;
                    return;
                }

                else
                {
                    if(current->next!=NULL && strcmp(temp->name,current->next->name)>0)
                    {
                        goto endloop;
                    }
                    else{
                    temp->next=current->next;
                    current->next=temp;
                    return ;
                    }
                }
            }
        endloop:
        prev=prev->next;
        current=current->next;
    }
    
    current=temp;
    prev->next=current;
     return;
    }
    return;
    }
   
int main(int argc, char *argv[]) {
    if (argc != 2) {
    printf("Syntax: ./HoopsRank <FILE>\n");
    return EXIT_SUCCESS;
    }
   char f[100];
     if (sscanf(argv[1], "%s", f) != 1) {
    printf("Syntax: ./HoopsRank <FILE>\n");
    return EXIT_SUCCESS;
  }
FILE* file=fopen(f,"r");
char str[63];
int ppg;
    int pgiven;
    int rdif;
   fscanf(file,"%s %d %d %d",str,&ppg,&pgiven,&rdif);
   struct hrank* head=(struct hrank*)malloc(sizeof(struct hrank));
   strcpy(head->name,str);
   head->metric=ppg-pgiven+rdif;
   head->next=NULL;
  fscanf(file,"%s",str);
while( strcmp(str,"DONE")!=0){
   fscanf(file," %d %d %d",&ppg,&pgiven,&rdif);
    newNode(head, str,ppg-pgiven+rdif);
   fscanf(file,"%s",str);
 }

fclose(file);
struct hrank* current;
current=head;
while(current!=NULL)
{
    printf("%s %d\n",current->name,current->metric);
    current=current->next;

}
while(head!=NULL)
{
    current=head;
    head=head->next;
    free (current);

}


return EXIT_SUCCESS;
}