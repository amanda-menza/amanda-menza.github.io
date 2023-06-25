/*C program called by5or6.c that prints out the first N positive 
numbers that are divisible by 5 or by 6, where N is an integer 
that is input to the program on the command line*/
#include <stdio.h>
#include <stdlib.h>
void createList( int *temp, int len)
{
    int count =1;
    int i=0;
    while(i<len)
    {
        if(count%5==0||count%6==0)
        {
            temp[i]=count;
            i++;
        }
        count++;
    }
}
int main(int argc, char *argv[]) {
    if (argc != 2) {
    printf("Syntax: ./by5or6 <NUM>\n");
    return EXIT_SUCCESS;
    }
    int num ;
   if (sscanf(argv[1], "%d", &num) != 1) {
    printf("Syntax: ./by5or6 <NUM>\n");
    return EXIT_SUCCESS;
  }

int list[num];
createList(list,num);
for(int i=0;i<num;i++){
    printf("%d\n",list[i]);
}
    return EXIT_SUCCESS;
}