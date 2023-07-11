/* MIPS assembly code program called by5or6.s that prints out the first N positive 
numbers that are divisible by 5 or by 6, where N is an integer 
that is input to the program on the command line*/

.text                           # Code segment
.align 2                        # ensure data segment items align to 2^2 = 4 bytes

main:                           # MAIN procedure Entrance
#initialize registers
li $t0,1                        #count
li $t1,0                        #index
li $t2,5
li $t3,6

#ask for input
li $v0, 4
la $a0, prompt
syscall

#read and save int
li $v0, 5
syscall

move $s0, $v0
loop: beq $s0,$t1, endloop          #branch when index reaches int value

div  $t0, $t2               # Divide count by 5
mfhi $t4                        #save remainder
beqz $t4, success
div  $t0, $t3               # Divide count by 5
mfhi $t4                        #save remainder
beqz $t4, success
j end

success: 
move $a0,$t0
li $v0,1
syscall

#print new line
li $v0,4                      
la $a0, nln
syscall
addi $t1,$t1,1

end:
addi $t0,$t0,1              #add 1 to count

j loop


endloop: 
jr $ra
.end main  


.data
prompt: .asciiz "Please enter an integer: "
nln: .asciiz "\n"